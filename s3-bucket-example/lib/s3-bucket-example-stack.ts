import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class S3BucketExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create s3 bucket named namnh240795-s3-bucket-example and has public read access

    const bucket = new cdk.aws_s3.Bucket(this, 'AWS-CF-S3Bucket-Public-Example', {
      bucketName: 'namnh240795-s3-bucket-example',
      versioned: true,
      publicReadAccess: true,
      blockPublicAccess: new cdk.aws_s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
  }
}
