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

# ROLES
resource "aws_iam_role" "lambda_exec_eft_twitter_listener" {
  name = var.lambdaFunctionDefaultRole

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Principal = {
        Service = "lambda.amazonaws.com"
      },
      Effect = "Allow",
      Sid    = ""
    }]
  })
}

# POLICY
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec_eft_twitter_listener.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# LAMBDA FUNCTION DEFINITION
resource "aws_lambda_function" "eft_twitter_listener" {
  function_name = var.lambdaFunctioName
  role          = var.lambdaFunctionDefaultRole
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
