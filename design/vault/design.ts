interface PektinEntity {
    name: string;
    type: PektinEntityType;
    vaultAccess: PektinSecretEngine[];
    password: string;
}

type PektinSecretEngine =
    | SignerPasswordFirstHalf
    | SignerPasswordSecondHalf
    | PektinSigner
    | PektinOfficerPasswordFirstHalft
    | PektinOfficerPasswordSecondHalft
    | PektinOfficer;

interface SignerPasswordFirstHalf {
    path: `kv/pektin-signer-password/1/${string}`;
    type: "kv";
}
interface SignerPasswordSecondHalf {
    path: `kv/pektin-signer-password/2/${string}`;
    type: "kv";
}

interface PektinSigner {
    path: string;
    type: "transit";
}

interface PektinOfficerPasswordFirstHalft {
    path: `kv/pektin-officer-password/${string}/`;
    type: "kv";
}
interface PektinOfficerPasswordSecondHalft {
    path: `kv/pektin-officer-password/${string}/`;
    type: "kv";
}
interface PektinOfficer {
    path: string;
    type: "kv";
}

type PektinEntityType = "client" | "api" | "signer" | "officer";

type VaultSecretEngineType = "transit" | "kv";

//
//
//
//

const acmeClient: PektinEntity = {
    name: "acme-client",
    password: "123456",
    type: "client",
    vaultAccess: [
        { path: "secrets/pektin-signer-passwords-1/*", type: "kv" }, // the acme client only has access to the first half of the password for the signing entity in this case for every domain
        { path: "secrets/pektin-officer-passwords-1/acme-client", type: "kv" } // the acme client only has access to the first half of the password for the entity that has access to the acme-client opa policy
    ]
};
// -> the client can never access the transit engine; the client can never see its own policy file in detail
// the client doesnt need to send its password to the api but just its vault access token that only can be used for n times

const pektinAPI: PektinEntity = {
    name: "pektin-api",
    password: "abcdefg",
    type: "api",
    vaultAccess: [
        { path: "secrets/pektin-signer-passwords-2/*", type: "kv" }, // has access to the second part of all signer passwords
        { path: "secrets/pektin-officer-passwords-2/*", type: "kv" } // has access to the second part of all officer passwords
    ]
};
// the api cant sign records on its own; the api cant read policies on its own

const domainSigner: PektinEntity[] = [
    {
        name: "y.gy.",
        password: "123456",
        type: "signer",
        vaultAccess: [{ path: "secrets/pektin-signers/y.gy", type: "transit" }] // the signer entity for the domain y.gy. has access to vaults signing engine for y.gy
    }
];

const officer: PektinEntity[] = [
    {
        name: "acme-client",
        password: "123456",
        type: "officer",
        vaultAccess: [{ path: "secrets/pektin-policies/acme.rego", type: "kv" }] // the acme-client-officer entity has access to the acme policy
    }
];
