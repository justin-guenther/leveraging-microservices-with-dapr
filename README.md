# Nutzung von Microservices mit DAPR

Dieses Repository enthält eine Sammlung von Microservices, die mit Node.js und Express.js implementiert wurden. Die Microservices sind sowohl ohne als auch mit dem Distributed Application Runtime (DAPR)-Framework implementiert, um die Unterschiede in den Architekturen zu zeigen.

## Übersicht
Die folgenden Microservices wurden in diesem Projekt implementiert:

1. **Produktkatalog (Product Catalog)**
2. **Warenkorb (Shopping Cart)**
3. **Bestellverwaltung (Order Management)**
4. **Bestellgenehmigung (Order Approval)**
5. **Rücksendungsmanagement (Returns Management)**

Jeder Microservice hat seine eigenen REST-API-Endpunkte und wird je nach Setup mit und ohne DAPR ausgeführt.

---

## Voraussetzungen

### Abhängigkeiten:
- [Node.js](https://nodejs.org/) (Für npm)
- [DAPR CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Docker](https://www.docker.com/) (Muss vorher gestartet werden)

### Repository klonen

```bash
git clone https://github.com/BUBULUBU/leveraging-microservices-with-dapr.git
cd 'leveraging-microservices-with-dapr'
```

## Installation der Abhängigkeiten:
Dieser Schritt kann bei der Verwendung von Docker übersprungen werden. Stattdessen können Sie direkt zu [Microservices starten](#microservices-starten) gehen.

```bash
# Installiere die Abhängigkeiten ohne DAPR (Vorgang wiederholen für jeden Microservice)
# Beispiel hier zeigt nur die Installation des Produkt Katalogs
# Ersetze productcatalog durch die anderen Services ebenfalls
cd 'Traditional Microservices'
cd 'microservices'
cd 'productcatalog'
npm install
```

### Microservices starten
```bash
# Docker-compose starten
cd 'Traditional Microservices'
cd 'microservices'
docker-compose up -d --build
```

## Installation (mit DAPR)

```bash
# DAPR installieren (falls nicht bereits installiert)
dapr init
```

Vorgang wie oben [Installation der Abhängigkeiten](#installation-der-abhängigkeiten) wiederholen nur im Verzeichnis `DAPR Microservices`.\
**Achtung: Der Schritt für die Installation der Abhängigkeiten kann bei der Verwendung von Docker übersprungen werden. Stattdessen können Sie direkt zu [Services & DAPR starten](#services--dapr-starten) gehen.**

### Services & DAPR starten
```bash
cd 'DAPR Microservices'
cd 'microservices'
docker-compose up -d --build
dapr run -f .
```

## Datenbank
Es befindet sich eine `createDB.sql` in `\database` der jeweiligen Architektur. Diese wird eigenständig ausgeführt sobald die docker-compose per Docker gestartet wurde. Das SQL-Skript kann auch eigenhändig in der Datenbank importiert werden.

### Zugangsdaten
```
Username: root
Password: root
```

# Fertig 😊
Nachdem alles Schritt für Schritt erledigt wurde, sollten die jeweiligen Services in Docker zu sehen sein. Nun können die jeweiligen [Endpunkte](#endpunkte) per Postman oder curl angesprochen werden!

# Endpunkte
### Eine Postman Kollektion ist in den jeweiligen Verzeichnissen mit oder ohne DAPR vorhanden und kann beliebig importiert werden.

# DAPR Endpunkte

## Product Catalog
### Get Product Catalog
```http
GET http://localhost:3500/v1.0/invoke/productcatalog/method/products
```

### Get Specific Product
```http
GET http://localhost:3500/v1.0/invoke/productcatalog/method/products/1
```

---

## Shopping Cart
### Get Cart
```http
GET http://localhost:3500/v1.0/invoke/shoppingcart/method/cart
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

### Add to Cart
```http
POST http://localhost:3500/v1.0/invoke/shoppingcart/method/cart
```
**Body (JSON):**
```json
{
    "uid": 1,
    "product_id": 2,
    "quantity": 1
}
```

### Remove Cart Item
```http
DELETE http://localhost:3500/v1.0/invoke/shoppingcart/method/cart
```
**Body (JSON):**
```json
{
    "uid": 1,
    "product_id": 2
}
```

### Publish Cart
```http
POST http://localhost:3500/v1.0/invoke/shoppingcart/method/cart/process
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

---

## Order Management
### Get Order
```http
GET http://localhost:3500/v1.0/invoke/ordermanagement/method/order
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

---

## Approvals
### Get Status For Approval
```http
GET http://localhost:3500/v1.0/invoke/orderapproval/method/approvals/1
```

### Approve Order
```http
PUT http://localhost:3500/v1.0/invoke/orderapproval/method/approvals/1/approve
```

### Reject Order
```http
PUT http://localhost:3500/v1.0/invoke/orderapproval/method/approvals/1/reject
```

---

## Return Management
### Get Status
```http
GET http://localhost:3500/v1.0/invoke/returnmanagement/method/returns/1
```

### Update Status
```http
PUT http://localhost:3500/v1.0/invoke/returnmanagement/method/returns/1/status
```
**Body (JSON):**
```json
{
    "newStatus": 1
}
```

### Init New Return
```http
POST http://localhost:3500/v1.0/invoke/returnmanagement/method/returns
```
**Body (JSON):**
```json
{
    "uid": 1,
    "order_id": 1
}
```

---

# Traditionelle Microservices Endpunkte (ohne DAPR)

## Product Catalog
### Get Products
```http
GET http://localhost:3500/products
```

### Get Specific Product
```http
GET http://localhost:3500/products/1
```

---

## Shopping Cart
### Get Cart
```http
GET http://localhost:3501/cart
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

### Add to Cart
```http
POST http://localhost:3501/cart
```
**Body (JSON):**
```json
{
    "uid": 1,
    "product_id": 2,
    "quantity": 1
}
```

### Remove Cart Item
```http
DELETE http://localhost:3501/cart
```
**Body (JSON):**
```json
{
    "uid": 1,
    "product_id": 2
}
```

---

## Order Management
### Get Order
```http
GET http://localhost:3502/order
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

### Process Order
```http
POST http://localhost:3502/order
```
**Body (JSON):**
```json
{
    "uid": 1
}
```

---

## Approvals
### Get Status For Approval
```http
GET http://localhost:3503/approvals/1
```

### Apply For Approval
```http
GET http://localhost:3503/approvals
```
**Body (JSON):**
```json
{
    "uid": 1,
    "order_id": 1
}
```

### Approve Order
```http
PUT http://localhost:3503/approvals/1/approve
```

### Reject Order
```http
PUT http://localhost:3503/approvals/1/reject
```

---

## Return Management
### Get Status
```http
GET http://localhost:5000/returns/1
```

### Update Status
```http
PUT http://localhost:5000/returns/1/status
```
**Body (JSON):**
```json
{
    "newStatus": 1
}
```

### Init New Return
```http
POST http://localhost:5000/returns
```
**Body (JSON):**
```json
{
    "uid": 1,
    "order_id": 1
}
```