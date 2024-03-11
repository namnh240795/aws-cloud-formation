import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class S3BucketPrivateExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create s3 bucket named namnh240795-s3-bucket-private-example and has private access

    const bucket = new cdk.aws_s3.Bucket(this, 'AWS-CF-S3Bucket-Private-Example', {
      bucketName: 'namnh240795-s3-bucket-private-example',
      versioned: true,
      publicReadAccess: false,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });


    // create cloudfront OAI
    const cloudfrontOAI = new cdk.aws_cloudfront.OriginAccessIdentity(this, 'AWS-CF-S3Bucket-Priavte-Example-CloudFrontOAI', {
      comment: 'OAI for namnh240795-s3-bucket-private-example',
    });

    // allow cloudfront to get object from namnh240795-s3-bucket-private-example
    const getObjectPolicy = new cdk.aws_iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/*`],
      principals: [new cdk.aws_iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
    });

    // add policy to bucket
    bucket.addToResourcePolicy(getObjectPolicy);

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    const distribution = new cdk.aws_cloudfront.Distribution(this, 'AWS-CF-S3Bucket-Private-Example-CloudFront', {
      defaultBehavior: {
        origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, {
          originAccessIdentity: cloudfrontOAI,
        }),
        allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cdk.aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new cdk.CfnOutput(this, 'AWS-CF-S3Bucket-Private-Example-CloudFront-Distribution-DomainName', {
      value: distribution.distributionDomainName,
    })
  }
}
