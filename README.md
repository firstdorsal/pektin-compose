# TODO create distinct redis passwords for different nodes

# TODO: GENERATE FULL VAULT API URL WITH INSTALL INTO .env

# TODO: figure out traefik certificate for multiple server domains and sni problem statet in js client install

# TODO Redis add capabilities to repl account

include the password for the replicant in the redis.conf like this:

```
aclfile /users.acl
replicaof pektin-redis-direktor 6379
masteruser r-pektin-gewerkschaft
masterauth bZgXq615L2kHIvOY9ESS8TDouCZM0i8E6rEvVGFcE_djeYKx_1l72HAnTjW_GpwvXw80E0hnM-SLq7Dxsw__5SE1EJXWqz7Sgv0CLVSjF3H8Dy7Ffg64GKb-jp_Bes0-pnqpTA
protected-mode yes
```

curl --http2-prior-knowledge -H 'accept: application/dns-message' -v 'http://localhost:8090/dns-query?dns=jz4BMAABAAAAAAAACXZvbmZvcmVsbAJkZQAAAQAB' | base64
