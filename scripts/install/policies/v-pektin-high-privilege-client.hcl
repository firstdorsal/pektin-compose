# every client has access to the basic pektin-api token
path "pektin-kv/data/gss_token" {
  capabilities = ["read"]
}
# no client can mutate the pektin-config but read it
path "pektin-kv/data/pektin-config" {
  capabilities = ["read"]
}
# every client has access to the recursor auth
path "pektin-kv/data/recursor-auth" {
  capabilities = ["read"]
}

# the high-privilege-client has full access to all foreign api secrets
path "pektin-kv/data/foreign-apis" {
  capabilities = ["create"]
}
path "pektin-kv/metadata/foreign-apis" {
  capabilities = ["delete"]
}