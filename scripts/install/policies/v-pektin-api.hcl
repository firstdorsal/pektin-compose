# allow signing data with all domain keys in pektin namespace*
path "pektin-transit/sign/+/sha2-256" {
  capabilities = ["update"]
}

# allow verifying data with all domain keys in pektin namespace*
path "pektin-transit/verify/+/sha2-256" {
  capabilities = ["update"]
}

# allow creation of new dnskeys in pektin namespace*
path "pektin-transit/keys/+" {
  capabilities = ["create","update","read"]
  allowed_parameters = {
    "type" = ["ecdsa-p256"]
  }
}
# allow rotation of pektin-api keys by pektin-api
path "pektin-kv/data/gss_token" {
  capabilities = ["create"]
}
path "pektin-kv/metadata/gss_token" {
  capabilities = ["delete"]
}
path "pektin-kv/data/gssr_token" {
  capabilities = ["create"]
}
path "pektin-kv/metadata/gssr_token" {
  capabilities = ["delete"]
}


# *its not an actual vault namespace