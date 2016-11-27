#! /bin/bash
aws cloudformation create-stack --stack-name code-deploy-test-new\
	--template-body file://cloudformation.json\
	--parameters \
		ParameterKey=KeyPairName,ParameterValue=jwasinger_key ParameterKey=TagKey,ParameterValue=foo \
		ParameterKey=TagValue,ParameterValue=bar \
		ParameterKey=KeyPairName,ParameterValue=jwasinger_key \
		ParameterKey=InstanceType,ParameterValue=t1.micro\
	--capabilities CAPABILITY_IAM
