variable "awsRegion" {
  type    = string
  default = "us-west-2"
}

variable "lambdaFunctioName" {
  type    = string
  default = "EFT-Twitter-Listener-Lambda"
}

variable "lambdaFunctionRoleArn" {
  type = string
  default = "arn:aws:iam::554014170727:role/lambda_exec_role_gar"
}

# APP ENV VARIABLES
variable "TWITTER_TOKEN" {
  type = string
}

variable "TWITTER_BASE_URL" {
  type = string
}

variable "DISCORD_BASE_URL" {
  type = string
}

variable "DISCORD_BOT_TOKEN" {
  type = string
}

variable "DISCORD_DEFAULT_CHANNEL_ID" {
  type = string
}

variable "DISCORD_BOT_ID" {
  type = string
}

variable "GANSO_DISCORD_USER_ID" {
  type = string
}
