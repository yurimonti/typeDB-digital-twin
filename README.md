# typeDB-digital-twin

typeDB-digital-twin is a management prototype tool based on a graph database model where assets, like IoT devices, can be represented in terms of their digital twins.
In particularly we used typeDB for Database technology (see: [TypeDB official page](https://vaticle.com/typedb).).
The tool implements CRUD API (we take inspiration by [Eclipse Ditto APIs](https://www.eclipse.org/ditto/)) with additional search functionalities over digital twin properties.

## Table of content

- [What is a digital-twin](#what-is-a-digital-twin)
- [Tech Stack](#tech-stack)
- [How to install](#how-to-install)


## What is a digital twin?

Digital twin is a digital representation of a physical asset (pumps, turbines, sensor, etc...).
This feature is famous in asset-intensive industries.
The real capability comes when an asset can be related to its surrounding environment, for instance a relation with other assets.
Using General Electric’s definition of Digital Twin for reference: “Digital twins are software representations of assets and processes that are used to understand, predict, and optimize performance in order to achieve improved business outcomes. Digital twins consist of three components: a data model, a set of analytics or algorithms, and knowledge.”
In our project we only focused on the data model parts.
These types of model semantic can easly represented by a graph, and infact, these data are always stored using technologies of Graph Databases.
For more information read this arcticle: [First Step to Digital Twin: Model your Asset Data](https://www.linkedin.com/pulse/first-step-digital-twin-model-your-asset-data-gregory-mckim/).


## Tech Stack

**Database:** [TypeDB](https://vaticle.com/typedb) (Graph Database)

**Server:** [Node](https://nodejs.org/en/about), [Express](https://expressjs.com/)


## Setup

First of all we need to install typeDB: there are more possibility to do that, so we suggest to see [TypeDB documentation](https://vaticle.com/download).
Secondly we suggest to download and use also TypeDB studio, downloadable on the same source of the previous one, because with that is possible to manage schema and query without using console.
Nextly we need to download and load our example schema `schema.tql` in a schema write transaction, using TypeDB studio or console if you want (We encourage you to see official documentation).

## How to run

First of all we need to download dependencies. So move in the project directory and run:

```bash
npm install
```

After that is possible to run the server:

```bash
npm start
```

Now is possible to call the APIs with a HTTP Client like [Postman](https://www.postman.com/).
The base url is the localhost with port 3030  `localhost:3030`.


## API Reference

A Thing is composed by:
- `thingId`, that represents the ID of a a thing.
- `attributes`, that represents the properties that a thing has.
- `features`, that represents the relation with its surrounding environment.

#### Get all Things

```http
  GET /things
```

#### Get a specific Thing

```http
  GET /things/{thingId}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `thingId`      | `string` | **Required**. Id of thing to get |


#### Create a specific Thing

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

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `thingId`      | `string` | **Required**. Id of thing to create |

return `200` code if parameters correspond to real parameters that are valid according to the schema, and create correlated Thing.
return `400` code if parameters are not compliant to the schema.

## License

[MIT](https://choosealicense.com/licenses/mit/)

