# Node.js Note Taker Skill 
Simple skill using AMAZON.SearchQuery and S3 to record, read, and delete notes. 

## Alexa Skill Usage Instructions
This project is meant to be used with ASK CLI V2. There is AWS infrastructure involved and you will also need an AWS account for this. This uses the ASK CLI V2 Lambda deployer. The code is defined in the lambda directory. 

## Deploy this Repo
If you want to run this sample, make sure you are running ASK CLI v2. For instructions on doing so and setting up an AWS IAM user for use with the CLI, see [the technical reference docs.](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html)

From your terminal, try:

`ask new --template-url https://github.com/sharpstef/alexa-note-taker-skill --template-branch main`

Select `AWS Lambda`.

Use the defaults for each of the answers. This will set you up with the skill. From there: 

To build this sample, first build the node packages:

1. `cd lambda`
2. `npm install`
3. `cd ..`

Then you can deploy using: `ask deploy` from this directory. Note: You will need to grant the IAM role for your Lambda function access to Delete and Put objects in an S3 bucket. 

### Add S3 Bucket
1. Create an S3 bucket in AWS. You do not need to (and should not) make this bucket public. 
1. Add an environment variable to your Lambda with a Key of `s3bucket` and a value of the name of the bucket you create in the last step. 
