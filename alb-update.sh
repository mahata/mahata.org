#!/bin/bash -xe

DATE_CURRENT_YMD=$(date '+%Y%m%d')
AWS_PROFILE="default"
CERT_NAME="letsencrypt-cert"
EXEC_AWS="aws --profile $AWS_PROFILE"
LE_EMAIL="mahata777@gmail.com"
LE_HOME=/root
EXEC_LE_AUTO="${LE_HOME}/bin/certbot-auto --email $LE_EMAIL --agree-tos"

DOMAINS=(
  "mahata.org"
  "www.mahata.org"
  "blog.mahata.org"
)

LE_FILES_ROOT=/etc/letsencrypt/live/${DOMAINS[0]}

CERT_PATH=$LE_FILES_ROOT/cert.pem
CHAIN_PATH=$LE_FILES_ROOT/chain.pem
FULLCHAIN_PATH=$LE_FILES_ROOT/fullchain.pem
PRIVKEY_PATH=$LE_FILES_ROOT/privkey.pem

source /root/.bash_profile

if [ -z "$LISTENER_ARN" ]; then
    echo "LISTENER_ARN env var needs to be set:" >&2
    echo "e.g. LISTENER_ARN=arn:aws:elasticloadbalancing:ap-northeast-1:xxx" >&2
    exit 1
fi

cd $(dirname $0)

# concatenate $DOMAINS with "-d" (i.e. -d "mahata.org" -d "www.mahata.org" ... )
LE_PARAM_DOMAINS=()
for domain in "${DOMAINS[@]}"; do
  LE_PARAM_DOMAINS+=("-d" "$domain")
done
LE_PARAM_DOMAINS="${LE_PARAM_DOMAINS[@]}"

# Request a certificate
$EXEC_LE_AUTO certonly --webroot --renew-by-default -w /usr/share/nginx/html $LE_PARAM_DOMAINS

# Get a list of current server certificates
OLD_SERVER_CERT_NAMES=$($EXEC_AWS iam list-server-certificates | jq -r ".ServerCertificateMetadataList[] | select(.ServerCertificateName | contains(\"${CERT_NAME}\")).ServerCertificateName")

# Discard old certificates
for cert_name in $OLD_SERVER_CERT_NAMES; do
  $EXEC_AWS iam delete-server-certificate --server-certificate-name $cert_name
done

# Upload new server certificate to IAM
$EXEC_AWS iam upload-server-certificate --server-certificate-name "${CERT_NAME}-${DATE_CURRENT_YMD}" --certificate-body file://$CERT_PATH --private-key file://$PRIVKEY_PATH --certificate-chain file://$CHAIN_PATH

sleep 5

# Get an ARN of the new server certificate
SERVER_CERT_ARN=$($EXEC_AWS iam list-server-certificates | jq -r ".ServerCertificateMetadataList[] | select(.ServerCertificateName == \"${NEW_SERVER_CERT_NAME}\").Arn")

# Put new server certificate to ELB (ALB)
$EXEC_AWS elbv2 modify-listener  --listener-arn $LISTENER_ARN --port 443 --protocol HTTPS --certificates CertificateArn=$SERVER_CERT_ARN
