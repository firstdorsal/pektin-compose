# required

-   docker
-   docker-compose plugin
-   rm
-   git
-   sh
-   grep
-   echo
-   sleep

# use

`bash setup.sh`

use local scripts dockerfile from this path: `-s=../pektin-js-client/`
delete everything: `-d=true`

in devmode this deletes everything and uses the local scripts dockerfile if present
`bash setup.sh -s=../pektin-js-client/ -d=true`

# TODO create distinct db passwords for different nodes

include the password for the replicant in the db.conf like this:

```
aclfile /users.acl
replicaof pektin-db-direktor 6379
masteruser 10.111.0.1
masterauth bZgXq615L2kHIvOY9ESS8TDouCZM0i8E6rEvVGFcE_djeYKx_1l72HAnTjW_GpwvXw80E0hnM-SLq7Dxsw__5SE1EJXWqz7Sgv0CLVSjF3H8Dy7Ffg64GKb-jp_Bes0-pnqpTA
protected-mode yes
```

curl --http2-prior-knowledge -H 'accept: application/dns-message' -v 'http://localhost:8090/dns-query?dns=jz4BMAABAAAAAAAACXZvbmZvcmVsbAJkZQAAAQAB' | base64

# temp pektin domain

create a pektin.io or similar subdomain for the installer to make routing work:

installer wants to use:

test.de.
ns1.test.de.
ns2.test.de.
ui-pektin.test.de.
etc.

but their domain is not set up yet/propagated

temporary domain from pektin.io to the rescue

pektin.io creates a random string that is used as a prefix:

abcde.pektin.zone
ns1.abcde.pektin.zone
ns2.abcde.pektin.zone
pektin-ui.abcde.pektin.zone

domains will be replaced as they instead could be easily enumerated in crt.sh by searching for pektin.zone

will be deleted after 7 days

яндекс.рф
