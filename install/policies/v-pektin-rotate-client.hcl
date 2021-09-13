# the rotate client can trigger a key rotation on the server in addition to everything else
path "pektin-kv/data/gssr_token" {
  capabilities = ["read"]
}

# no client can mutate the pektin-config but read it
path "pektin-kv/data/pektin-config" {
  capabilities = ["read"]
}

# the pektin-rotate-client has full access to all foreign api secrets
path "pektin-kv/data/foreign-apis" {
  capabilities = ["create"]
}
path "pektin-kv/metadata/foreign-apis" {
  capabilities = ["delete"]
}