# every client has access to the basic pektin-api token
path "pektin-kv/data/gss_token" {
  capabilities = ["read"]
}
# no client can mutate the pektin-config
path "pektin-kv/data/pektin-config" {
  capabilities = ["read"]
}