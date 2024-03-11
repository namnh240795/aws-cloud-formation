import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class S3BucketWebExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, 'AWS-CF-S3Bucket-Web-Public-Example', {
      bucketName: 'namnh240795-s3-bucket-web-example',
      versioned: true,
      publicReadAccess: true,
      blockPublicAccess: new cdk.aws_s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [cdk.aws_s3_deployment.Source.asset(process.cwd() + "/build")],
      destinationBucket: bucket,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'BucketUrl', {
      value: bucket.bucketWebsiteUrl,
    });
  }
}
