import * as dotenv from 'dotenv';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

const getSecret = async () => {
  const secret_name =
    'arn:aws:secretsmanager:ap-southeast-1:571678314364:secret:namnh240795-db-secret-9SDLQE';

  const client = new SecretsManagerClient({
    region: 'ap-southeast-1',
  });

  let response;

  try {
    response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      }),
    );
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  const secret = response.SecretString;
  const secretObj = JSON.parse(secret);

  console.log('getSecret -> secret', secretObj);
  const DBPASS = secretObj.password;
  const DBUSER = secretObj.username;
  const DBHOST = secretObj.host;
  const DBPORT = secretObj.port;
  const DBNAME = secretObj.dbname;
  // write all this into .env
  fs.writeFileSync(
    path.join(__dirname, '.env'),
    `DBPASS=${DBPASS}\nDBUSER=${DBUSER}\nDBHOST=${DBHOST}\nDBPORT=${DBPORT}\nDBNAME=${DBNAME}`,
  );
};

getSecret();
