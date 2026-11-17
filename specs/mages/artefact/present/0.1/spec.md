---
slug: mages/artefact/present
version: "0.1"
title: Artefact — Present
summary: A bearer presents an artefact forged or witnessed in the spellweb ceremony (its blade, the constellation it was evoked from, and the blade's place on the bearer's chain), and the verifier answers with the checks it could re-derive.
status: draft
targetFrameworkVersion: "0.6.0"
category: provenance
keywords:
  - agentprivacy
  - spellweb
  - artefact
  - blade
  - witness
  - hash-chain
  - evidence
authors:
  - Mitch (https://github.com/mitchuski)
parties:
  - role: Bearer (the Swordsman who forged or witnessed the artefact)
    requirement: REQUIRED
    member: issuer
    identifierScope: pairwise
  - role: Verifier (a Mages City keeper, a workshop, or a site that reads City Keys)
    requirement: REQUIRED
    member: recipient
    identifierScope: public
proofRequirement:
  request: OPTIONAL
  response: RECOMMENDED
  rationale: >-
    The artefact is self-describing by hash commitments: the commitment locks the
    constellation before the evoke, the blade hash binds the blade to its
    predecessor, and a witness blade names the constellation it witnessed. An
    envelope signature by a key the verifier does not recognise adds nothing.
    Once the bearer has joined through the Star Key, the member's VTA signs the
    presentation (the mldsa65-ed25519 composite), binding the artefact to the
    member rather than to whoever holds a copy.
issuedAtRequirement:
  requirement: RECOMMENDED
  rationale: >-
    issuedAt places the presentation in time against the artefact's own forgedAt;
    the framework baseline is enough.
sideEffects:
  level: none
  rationale: >-
    Verification only. What a keeper or workshop does with a recognised artefact
    (a seat lit, a membership step) is a separate act under its own task.
exposure:
  discloses: metadata
  ingests: metadata
  actsAsSubject: false
  rationale: >-
    Ingests the artefact's hashes, its name and emoji, its tier and stratum, the
    constellation node ids it was evoked from, and, for a witness, whose
    constellation it witnessed. No identity beyond the issuer string; no text of
    the graph's documents.
retention:
  class: exchange
  rationale: >-
    The verifier needs the artefact only while it checks it. Any record kept is
    made under the task that keeps it.
errorCodes: []
related:
  - mages/island/stone
  - mages/constellation/commit
  - mages/presence/thumb
---

## Abstract

In the spellweb ceremony a bearer traces a constellation through the knowledge
graph, evokes it, and forges a **blade**: an artefact whose proof commits to the
constellation before the evoke and links to the bearer's previous blade. A
bearer can also **witness** another's constellation from its artefact `.md`,
producing a witness blade that names the constellation it witnessed.

**Artefact — Present** is the presentation of one such artefact as evidence.
spellweb issues the document when the blade is forged or witnessed and, when
the bearer holds a City Key, carries it in the key's journey as a `trust-task`
step (journey bundle `agentprivacy.journey-bundle/1`). The verifier re-derives
what the hashes allow and reports what it could check. It proves that an
artefact with these commitments was made and where it sits on its bearer's
chain. It does not prove who the bearer is: joining adds that.

## Status of this Document

This is a **draft**, **private** *Trust Task specification*, published under the Mages City namespace
(`https://tasks.mages.city/spec/mages/`) as part of the **mages** family; this
is the spellweb profile of it. The payload is the artefact kind
`spellweb/artefact/1` as spellweb builds it today. The schema **MAY** change
without notice.

## Conformance

[[RFC2119]](https://www.rfc-editor.org/rfc/rfc2119) and [[RFC8174]](https://www.rfc-editor.org/rfc/rfc8174) key-word conventions apply.

A conforming **producer** (the bearer's spellweb) **MUST**:

1. Emit a *Trust Task document* whose `type` is `https://tasks.mages.city/spec/mages/artefact/present/0.1`, with `issuer` set to the bearer's Swordsman participant id from their City Key where held, else their mage id, else `spellweb:local`.
2. Derive the document `id` from the proof signature (`urn:spellweb:artefact:<signature>`), so that one artefact is one task and carrying it twice folds once.
3. Copy the proof fields exactly as the ceremony produced them; a re-computed value will not re-derive.

A conforming **consumer** (the verifier) **MUST** perform the checks below that
its inputs allow and return their results in a `#response`. A failed check is a
successful verification with a negative result (`ok: false`), not an error.

### Verification

0. **Shape.** `kind` is `spellweb/artefact/1`; the schema enforces the rest. A failure is `malformedRequest`.
1. **The commitment opens.** Where the verifier is given the commitment nonce out of band, `sha256(constellationHash + nonce) == commitment`. Otherwise the check reports `commitmentVerified` as the producer stated it, reported as `notReDerived`.
2. **The constellation re-derives.** Where `constellation` is present, hashing its node ids as spellweb's `hashConstellation` does gives `constellationHash`.
3. **The chain holds.** `chainLength` is 1 exactly when `previousBladeHash` is null. Where the verifier holds the bearer's earlier artefacts, the previous one's `bladeHash` equals this one's `previousBladeHash`.
4. **A witness names what it witnessed.** For a witness artefact, `artefact.witness.of` is the witnessed constellation hash and **SHOULD** equal `proof.constellationHash`.
5. **Carried** (OPTIONAL). Where the artefact arrives inside a journey bundle, the bundle's `validateBundle` passes and its journey has a `trust-task` step with this document's `id`, `type` and commitment.

The determination is `ok` when every check performed passed.

## Definitions

- **Blade** — an artefact forged at the ceremony: name, emoji, tier (`light` · `heavy` · `dragon`), stratum (0–6, the Hamming weight of its six dimensions) and proof.
- **Witness blade** — a blade forged from another bearer's artefact `.md`; it carries `witness.of` (that constellation's hash) and `witness.from` (the source's label).
- **Constellation** — the ordered node ids of the knowledge-graph path the bearer traced and evoked.

## Request

A bearer who holds a City Key presents their first light blade to Mages City.

```json
{
  "id": "urn:spellweb:artefact:9c1f2e3d4c5b6a7980a1b2c3d4e5f601",
  "type": "https://tasks.mages.city/spec/mages/artefact/present/0.1",
  "issuer": "ap-3fa29c0d1b7e4a55",
  "recipient": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "issuedAt": "2026-11-17T09:00:00Z",
  "payload": {
    "kind": "spellweb/artefact/1",
    "artefact": { "id": "blade-1763370000000", "name": "Dawn Measure", "emoji": "🌅", "tier": "light", "stratum": 3, "forgedAt": "2026-11-17T08:59:41Z" },
    "proof": {
      "constellationHash": "a41c9e0b2f7d6c85",
      "bladeHash": "e3b7a1c2d4e5f6071829304a5b6c7d8e",
      "previousBladeHash": null,
      "chainLength": 1,
      "commitment": "5d0a1b2c3d4e5f60718293a4b5c6d7e8",
      "commitmentVerified": true,
      "signature": "9c1f2e3d4c5b6a7980a1b2c3d4e5f601",
      "chargeLevel": "flame",
      "lapCount": 3,
      "nodeCount": 13
    },
    "constellation": ["shop-horizon", "c-durability", "t-mosca"]
  }
}
```

## Response

The verifier was not given the commitment nonce, so it reports the commitment
as `notReDerived`; the blade is not a witness blade and came without a bundle.

```json
{
  "id": "urn:uuid:0b7e4c21-9d3a-4f86-a5e2-61c9d0f3b874",
  "type": "https://tasks.mages.city/spec/mages/artefact/present/0.1#response",
  "threadId": "urn:spellweb:artefact:9c1f2e3d4c5b6a7980a1b2c3d4e5f601",
  "issuer": "did:webvh:QmQ8GMNCTui2H9gjxQWByS1ScsWkByaeQHYnzhcET1UPne:dids.mages.city:vtc",
  "recipient": "ap-3fa29c0d1b7e4a55",
  "issuedAt": "2026-11-17T09:00:02Z",
  "payload": {
    "ok": true,
    "checks": { "shape": true, "commitment": "notReDerived", "constellation": true, "chain": true, "witness": "notPerformed" }
  }
}
```

## Security & Privacy

### Data carried

Hashes, a name and emoji the bearer's ceremony chose, a tier and stratum, and,
only if the bearer includes it, the ordered node ids of the path they traced.
The node ids name public pages of the spellweb graph, so together they say what
the bearer chose to study; a bearer who does not want that read omits
`constellation`, and the verifier then reports that check `notPerformed`. No
text of the graph and no personal data are carried.

### Correlation

The bearer's identifier is pairwise: the Swordsman participant id of their City
Key, minted for the City relationship, or `spellweb:local` before they hold one.
Every artefact presented under it is joinable to every other, which is the point
of a blade chain (`previousBladeHash`). The verifier's identifier scope is
`public` because the response is evidence the bearer may carry to others, who
must be able to see which verifier made the determination; a pairwise verifier
identifier would make the response unreadable to anyone but the bearer and would
protect nobody, the verifier being a public party (Mages City, a workshop).

### Retention

The verifier keeps the document only while it checks it. Anything kept after
(a seat lit, a step recorded) is kept under the task that keeps it, with that
task's retention. The bearer keeps the response in their journey.

### Consent/purpose

The bearer presents the artefact by choice, to the verifier they name, for one
purpose: to have its proof checked. A verifier **MUST NOT** use a presentation
to build a reading profile from `constellation` across bearers.
