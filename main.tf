terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.awsRegion
}

# LAMBDA FUNCTION DEFINITION
resource "aws_lambda_function" "eft_twitter_listener" {
  function_name = var.lambdaFunctioName
  role          = var.lambdaFunctionRoleArn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = "lambda.zip"

  source_code_hash = filebase64sha256("lambda.zip")

  environment {
    variables = {
      TWITTER_TOKEN              = var.TWITTER_TOKEN
      TWITTER_BASE_URL           = var.TWITTER_BASE_URL
      DISCORD_BASE_URL           = var.DISCORD_BASE_URL
      DISCORD_BOT_TOKEN          = var.DISCORD_BOT_TOKEN
      DISCORD_DEFAULT_CHANNEL_ID = var.DISCORD_DEFAULT_CHANNEL_ID
      DISCORD_BOT_ID             = var.DISCORD_BOT_ID
      GANSO_DISCORD_USER_ID      = var.GANSO_DISCORD_USER_ID
    }
  }
}

# EVENTBRIDGE DEFINITION
resource "aws_cloudwatch_event_rule" "eft_twitter_listener_schedule" {
  name = "eft-twitter-listener-schedule"
  schedule_expression = "rate(8 hours)"
  description = "Schedule execution for Lambda function"
}

# EVENTBRIDGE PERMISSION
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.eft_twitter_listener.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.eft_twitter_listener_schedule.arn
}

# EVENTBRIDGE TARGET
resource "aws_cloudwatch_event_target" "trigger_lambda" {
  rule      = aws_cloudwatch_event_rule.eft_twitter_listener_schedule.name
  target_id = "EFTTwitterListener"
  arn       = aws_lambda_function.eft_twitter_listener.arn
}
