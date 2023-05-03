# typeDB-digital-twin

typeDB-digital-twin is a management prototype tool based on a graph database model where assets, like IoT devices, can be represented in terms of their digital twins.
In particular, we used typeDB for Database technology (see: [TypeDB official page](https://vaticle.com/typedb).).
The tool implements CRUD API (we take inspiration from [Eclipse Ditto APIs](https://www.eclipse.org/ditto/)) with additional search functionalities over digital twin properties.

## Table of content
- [typeDB-digital-twin](#typedb-digital-twin)
  - [Table of content](#table-of-content)
  - [What is a digital twin?](#what-is-a-digital-twin)
  - [Tech Stack](#tech-stack)
  - [TypeDB](#typedb)
    - [A higher level of expressivity](#a-higher-level-of-expressivity)
    - [A higher degree of safety](#a-higher-degree-of-safety)
    - [Evolved with logical inference](#evolved-with-logical-inference)
    - [A robust and programmatic API](#a-robust-and-programmatic-api)
  - [Setup](#setup)
  - [How to run](#how-to-run)
  - [API Reference](#api-reference)
    - [GET requests](#get-requests)
    - [POST requests](#post-requests)
    - [DELETE requests](#delete-requests)
    - [PUT requests](#put-requests)

## What is a digital twin?

Digital twin is a digital representation of a physical asset (pumps, turbines, sensor, etc...).
This feature is famous in asset-intensive industries.
The real capability comes when an asset can be related to its surrounding environment, for instance a relation with other assets.
Using General Electrics definition of Digital Twin for reference: “Digital twins are software representations of assets and processes that are used to understand, predict, and optimize performance in order to achieve improved business outcomes. Digital twins consist of three components: a data model, a set of analytics or algorithms, and knowledge.”
In our project we only focused on the data model parts.
These types of model semantics can easily be represented by a graph, and in fact, these data are always stored using technologies of Graph Databases.
For more information read this article: [First Step to Digital Twin: Model your Asset Data](https://www.linkedin.com/pulse/first-step-digital-twin-model-your-asset-data-gregory-mckim/).


## Tech Stack

**Database:** [TypeDB](https://vaticle.com/typedb) (Graph Database)

**Server:** [Node](https://nodejs.org/en/about), [Express](https://expressjs.com/)

## TypeDB

**TypeDB** is a **strongly-typed** database with a rich and logical type system.  TypeDB empowers you to tackle complex problems, and **TypeQL** is its query language.

There are some advantages of using this technology:
- Ability to handle complex data models: TypeDB is designed to handle complex data models that are difficult to manage with traditional databases. It provides a schema-like structure that allows for relationships between entities to be defined and managed.
- Flexible data management: TypeDB supports various data types including text, numbers, dates, and more. It also allows for data to be organized and queried in different ways, making it a flexible option for data management.
- Scalability: TypeDB is designed with scalability in mind, allowing businesses to scale up or down as needed. It can handle large amounts of data and high transaction volumes.
- Natural language processing: TypeDB has natural language processing capabilities, which makes it easier for users to ask questions and get relevant results.
- Query language: TypeDB has its own query language called TypeQL, which is optimized for querying complex data models. It is similar to SQL but is designed to handle relationships between entities.

###  A higher level of expressivity
TypeDB allows you to model your domain based on logical and object-oriented principles. Composed of entity, relationship, and attribute types, as well as type hierarchies, roles, and rules, TypeDB allows you to think higher-level, as opposed to join-tables, columns, documents, vertices, edges, and properties.
#### Entity-Relationship Model
TypeDB allows you to model your domain using the well-known Entity-Relationship model. It is composed of entity types, relation types, and attribute types, with the introduction of role types. TypeDB allows you to leverage the full expressivity of the ER model, and describe your schema through first normal form.
#### Type Hierarchies
TypeDB allows you to easily model type inheritance into your domain model. Following logical and object-oriented principles, TypeDB allows data types to inherit the behaviors and properties of their supertypes. Complex data structures become reusable, and data interpretation becomes richer through polymorphism.
#### N-ary Relations
In the real world, relations are not  just binary connections between two things. In rich systems, we often need to capture three or more things related with each other at once. Representing them as separate binary relationships would lose information. TypeDB can naturally represent an arbitrary number of things as one relation.
#### Nested Relations
Relations are concepts we use to describe the association between two or more things. Sometimes, those things can be relations themselves. TypeDB can represent these structures naturally, as it enables relations to be nested in another relation, allowing you to express the model of your system in the most natural form.

### A higher degree of safety
Types provide a way to describe the logical structures of your data, allowing TypeDB to validate that your code inserts and queries data correctly. Query validation goes beyond static type-checking, and includes logical validation of meaningless queries. With strict type-checking errors, you have a dataset that you can trust.
#### Logical Data Validation
Inserted data gets validated beyond static type-checking of attribute value types. Entities are validated to only have the correct attributes, and relations are validated to only relate things that are logically allowed. TypeDB performs richer validation of inserted entities and relations by evaluating the polymorphic types of the things involved.
#### Logical Query Validation
Read queries executed on TypeDB go through a type resolution process. This process not only optimizes the query's execution, but also acts as a static type checker to reject meaningless and unsatisfiable queries, as they are likely a user error.

### Evolved with logical inference
TypeDB encodes your data for logical interpretation by a reasoning engine. It enables type-inference and rule-inference, which create logical abstractions of data. This allows the discovery of facts and patterns that would otherwise be too hard to find; and complex queries become much simpler.
#### Rules
TypeDB allows you to define rules in your schema. This extends the expressivity of your model as it enables the system to derive new conclusions when a certain logical form in your dataset is satisfied. Like functions in programming, rules can chain onto one another, creating abstractions of behavior at the data level.
#### Inference
TypeDB's inference facility translates one query into all of its possible interpretations. This happens through two mechanisms: type-based and rule-based inference. Not only does this derive new conclusions and uncovers relationships that would otherwise be hidden, but it also enables the abstraction of complex patterns into simple queries.

### A robust and programmatic API
TypeDB Clients provide stateful objects, Sessions and Transactions, to interact with the database programmatically. The transactions provide ACID guarantees, up to snapshot isolation.
#### ACID Transactions
TypeDB provides ACID guarantees, up to Snapshot Isolation, through of schema validation and consistent transactions. With lightweight optimistic transactions, TypeDB allows a high number of concurrent read and write transactions. With atomic all-or-nothing commits, transactional semantics become easy to reason over.


## Setup

First of all we need to install typeDB: there are more possibilities to do that, so we suggest to see [TypeDB documentation](https://vaticle.com/download).
Secondly we suggest downloading and also use TypeDB studio, downloadable on the same source of the previous one, because with that it is possible to manage schema and query without using console.

Subsequently, we need to download and load our example schema `schema.tql` in a schema write transaction, using TypeDB studio or console if you want (We encourage you to see official documentation).

## How to run

First of all we need to download dependencies. So move in the project directory and run:

```bash
npm install
```

After that is possible to run the server:

```bash
npm start
```

Now it is possible to call the APIs with an HTTP Client like [Postman](https://www.postman.com/).
The base url is the localhost with port 3030  `localhost:3030`.


## API Reference

A Thing is composed by:
- `thingId`, that represents the ID of a thing.
- `attributes`, that represents the properties that a thing has. (category and typology cannot be modified or deleted).
- `features`, that represents the relation with its surrounding environment.

## GET requests

---
#### Get all Things
Get all things
```http
  GET /things
```

#### Get a specific Thing
Get a specific thing with id `thingId`.
```http
  GET /things/{thingId}
```

| Parameter | Type     | Description                      |
|:----------|:---------|:---------------------------------|
| `thingId` | `string` | **Required**. Id of thing to get |

return thing with `thingId` with `200` code.
return `404` code if there is none thing with `thingId`.

#### Get attributes of a specific Thing
Get all attributes of a thing with id `thingId`.
```http
  GET /things/{thingId}/attributes
```

| Parameter | Type     | Description                      |
|:----------|:---------|:---------------------------------|
| `thingId` | `string` | **Required**. Id of thing to get |

return thing `attributes` with `thingId` and `200` code.
return `404` code if there is none thing with `thingId`.

#### Get specific attribute of a specific Thing
Get a specific attribute of a thing with id `thingId`.
```http
  GET /things/{thingId}/attributes/{attribute}
```

| Parameter   | Type     | Description                             |
|:------------|:---------|:----------------------------------------|
| `thingId`   | `string` | **Required**. Id of thing to get        |
| `attribute` | `string` | **Required**. attribute of thing to get |

return thing `attribute` with `thingId` and `200` code.
return `404` code if there is none thing with `thingId` or `attribute` not exists.

#### Get features of a specific Thing
Get all features of a thing with id `thingId`.
```http
  GET /things/{thingId}/features
```

| Parameter | Type     | Description                      |
|:----------|:---------|:---------------------------------|
| `thingId` | `string` | **Required**. Id of thing to get |

return thing `features` with `thingId` and `200` code.
return `404` code if there is none thing with `thingId`.

#### Get specific feature of a specific Thing
Get a specific feature, following `featurePath`, of a thing with id `thingId`.
```http
  GET /things/{thingId}/features/{featurePath}
```

| Parameter     | Type     | Description                           |
|:--------------|:---------|:--------------------------------------|
| `thingId`     | `string` | **Required**. Id of thing to get      |
| `featurePath` | `string` | **Required**. feature of thing to get |

return thing feature `featurePath` with `thingId` and `200` code.
return `404` code if there is none thing with `thingId`, or `featurePath` doesn't exist.

---
### POST requests

---

#### Create a Thing
Add new thing with specific attributes (required) and features.
```http
  POST /things
  content-type: application/json

{   
    "thingId":"thingId",
    "attributes": {
      "nameAttribute1": "value1",
      "nameAttribute1":"value2"
    },
    "features": {
      "typeFeature1": {
        "featureId1": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId1"
        },
        "featureId2": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId2"
        }
      },
      "typeFeature2": {
        "featureId3": {
          "role1Id2": "thingId",
          "role2Id": "relatedToId3"
        }
      }
    }
  }
```

| Parameter         | Type     | Description                                    |
|:------------------|:---------|:-----------------------------------------------|
| `body.thingId`    | `string` | **Required**. Id of thing to create            |
| `body.attributes` | `JSON`   | **Required**. attributes to associate to thing |
| `body.features`   | `JSON`   | features to associate to thing                 |

return `200` code if parameters correspond to real parameters that are valid according to the schema, and create correlated Thing.
return `404` code if `attribute.thingId` already exists.
return `400` code if parameters are not compliant to the schema.

#### Update a Thing
Modify properties that are already present on thing and add ones are not. (According to the schema).
```http
  POST /things/{thingId}
  content-type: application/json

{   
    "attributes": {
      "nameAttribute1": "value1",
      "nameAttribute1":"value2"
    },
    "features": {
      "typeFeature1": {
        "featureId1": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId1"
        },
        "featureId2": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId2"
        }
      },
      "typeFeature2": {
        "featureId3": {
          "role1Id2": "thingId",
          "role2Id": "relatedToId3"
        }
      }
    }
  }
```

| Parameter         | Type     | Description                         |
|:------------------|:---------|:------------------------------------|
| `thingId`         | `string` | **Required**. Id of thing to create |
| `body.attributes` | `JSON`   | **Required**. attributes to update  |
| `body.features`   | `JSON`   | features to update                  |

return `200` code if parameters correspond to real parameters that are valid according to the schema.
return `404` code if `attribute.thingId` not exists.
return `404` code if `attribute.category` or `attribute.typology` are present on attributes. (they cannot be modified).
return `400` code if parameters are not compliant to the schema.

#### Update a Thing attributes
Modify attributes that are already present on thing and add ones that are not. (According to the schema).
Category and Typology attributes cannot be changed.
```http
  POST /things/{thingId}/attributes
  content-type: application/json

{   
    "attributes": {
      "nameAttribute1": "value1",
      "nameAttribute1":"value2"
    }
  }
```

| Parameter         | Type     | Description                         |
|:------------------|:---------|:------------------------------------|
| `thingId`         | `string` | **Required**. Id of thing to create |
| `body.attributes` | `JSON`   | **Required**. attributes to update  |

return `200` code if parameters correspond to real parameters that are valid according to the schema.
return `404` code if `thingId` doesn't exist.
return `404` code if `attribute.category` or `attribute.typology` are present on attributes. (they cannot be modified).
return `400` code if parameters are not compliant to the schema.

#### Update a Thing features
Modify features that are already present on thing and add ones that are not. (According to the schema).
```http
  POST /things/{thingId}/features
  content-type: application/json

{   
    "features": {
      "typeFeature1": {
        "featureId1": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId1"
        },
        "featureId2": {
          "role1Id1": "thingId",
          "role2Id2": "relatedToId2"
        }
      },
      "typeFeature2": {
        "featureId3": {
          "role1Id2": "thingId",
          "role2Id": "relatedToId3"
        }
      }
    }
  }
```

| Parameter       | Type     | Description                         |
|:----------------|:---------|:------------------------------------|
| `thingId`       | `string` | **Required**. Id of thing to create |
| `body.features` | `JSON`   | **Required**. features to update    |

return `200` code if parameters correspond to real parameters that are valid according to the schema.
return `404` code if `thingId` doesn't exist.
return `400` code if parameters are not compliant to the schema.

---
### DELETE requests

---

#### Delete a Thing
Delete a specific thing with id `thingId`.
```http
  DELETE /things/{thingId}
```

| Parameter | Type     | Description                         |
|:----------|:---------|:------------------------------------|
| `thingId` | `string` | **Required**. Id of thing to delete |

return `200` code.
return `404` code if there is none thing with `thingId`.

#### Delete attributes of a specific Thing
Delete all attributes of a thing with id `thingId`.
```http
  DELETE /things/{thingId}/attributes
```

| Parameter | Type     | Description                         |
|:----------|:---------|:------------------------------------|
| `thingId` | `string` | **Required**. Id of thing to delete |

return `200` code.
return `404` code if there is none thing with `thingId`.

#### Delete features of a specific Thing
Delete all features of a thing with id `thingId`.
```http
  DELETE /things/{thingId}/features
```

| Parameter | Type     | Description                         |
|:----------|:---------|:------------------------------------|
| `thingId` | `string` | **Required**. Id of thing to delete |

return `200` code.
return `404` code if there is none thing with `thingId`.

#### Delete specific attribute of a specific Thing
Delete a specific attribute of a thing with id `thingId`.
```http
  DELETE /things/{thingId}/attributes/{attribute}
```

| Parameter   | Type     | Description                                |
|:------------|:---------|:-------------------------------------------|
| `thingId`   | `string` | **Required**. Id of thing to get           |
| `attribute` | `string` | **Required**. attribute of thing to delete |

return `200` code.
return `404` code if there is none thing with `thingId` or `attribute` doesn't exist.

#### Delete specific feature of a specific Thing
Delete a specific feature of a thing with id `thingId`.
```http
  DELETE /things/{thingId}/features/{featurePath}
```

| Parameter     | Type     | Description                              |
|:--------------|:---------|:-----------------------------------------|
| `thingId`     | `string` | **Required**. Id of thing to get         |
| `featurePath` | `string` | **Required**. feature of thing to delete |

return `200` code.
return `404` code if there is none thing with `thingId` or `featurePath` doesn't exist.

#### Delete a feature
Delete only one feature with the specified `featureId`.
```http
  DELETE /features/{featureId}
```

| Parameter   | Type     | Description                           |
|:------------|:---------|:--------------------------------------|
| `featureId` | `string` | **Required**. Id of feature to delete |

return `200` code.
return `404` code if there is none feature with `featureId`.

#### Delete multiple features
Delete multiple features contained in the body. 
```http
  DELETE /features
```

| Parameter         | Type       | Description                             |
|:------------------|:-----------|:----------------------------------------|
| `body.relationId` | `string[]` | **Required**. Ids of features to delete |

return `200` code.
return `404` code if there is none feature contained in `relationId`.


#### Delete multiple things
Delete multiple things contained in the body. 
```http
  DELETE /things
```

| Parameter      | Type       | Description                           |
|:---------------|:-----------|:--------------------------------------|
| `body.thingId` | `string[]` | **Required**. Ids of things to delete |

return `200` code.
return `404` code if there is none thing contained in `thingId`.

---
### PUT requests

---

#### Total update a Thing
Full update a specific thing with id `thingId`.
```http
  PUT /things/{thingId}
```

| Parameter | Type     | Description                               |
|:----------|:---------|:------------------------------------------|
| `thingId` | `string` | **Required**. Id of thing to total update |

return `200` code.
return `404` code if there is none thing with `thingId`.
return `400` code if parameters are not compliant to the schema.

#### Total update attributes of a Thing
Full update attributes of a specific thing with id `thingId`.
```http
  PUT /things/{thingId}/attributes
```

| Parameter         | Type     | Description                               |
|:------------------|:---------|:------------------------------------------|
| `thingId`         | `string` | **Required**. Id of thing to total update |
| `body.attributes` | `JSON`   | **Required**. attributes to total update  |

return `200` code.
return `404` code if there is none thing with `thingId` or attributes missing .
return `400` code if parameters are not compliant to the schema.

#### Total update a Thing
Full update a specific thing with id `thingId`.
```http
  PUT /things/{thingId}/features
```

| Parameter       | Type     | Description                               |
|:----------------|:---------|:------------------------------------------|
| `thingId`       | `string` | **Required**. Id of thing to total update |
| `body.features` | `JSON`   | **Required**.  features to total update   |

return `200` code.
return `404` code if there is none thing with `thingId` or features missing.
return `400` code if parameters are not compliant to the schema.

## License

[MIT](https://choosealicense.com/licenses/mit/)
