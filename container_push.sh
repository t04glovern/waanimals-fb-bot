#!/bin/sh

# Create ECR (if not already existing)
aws ecr create-repository --repository-name "waanimals-fb-bot-webhook"

ACCOUNT_ID=$(aws sts get-caller-identity |  jq -r '.Account')
$(aws ecr get-login --no-include-email --region us-east-1)

docker build -t waanimals-fb-bot-webhook ./messenger-bot/
docker tag waanimals-fb-bot-webhook:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/waanimals-fb-bot-webhook:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/waanimals-fb-bot-webhook:latest