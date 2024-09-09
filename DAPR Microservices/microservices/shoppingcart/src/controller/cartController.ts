// default
import HttpStatusCode from '../entities/HttpStatusCode';

// services
import axios from 'axios';
import {CommunicationProtocolEnum, DaprClient, HttpMethod} from "@dapr/dapr";

// configuration
const daprHost = "http://localhost";
const daprPort = "3500";

const stateStoreName = `statestore`;

// Initialize Dapr client
const client = new DaprClient({daprHost, daprPort});

const handleGetCart = async (req, res) => {
    try {
        const {uid} = req.body;

        // Check Dapr state store
        const cachedCart = await client.state.get(stateStoreName, `cart:${uid}`);

        return res.status(HttpStatusCode.OK).json(cachedCart);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Warenkorb konnte nicht abgerufen werden!'});
    }
}

const handleAddCartItem = async (req, res) => {
    try {
        const {uid, product_id, quantity} = req.body;

        const productsResponse = await axios.get(`${daprHost}:${daprPort}/products`, {
            headers: {
                "dapr-app-id": "productcatalog"
            }
        });

        const products = productsResponse.data;

        const existingProduct = products.find((product: { id: number; }) => product.id === product_id);

        if (!existingProduct) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({message: 'Produkt existiert nicht!'});
        }

        // Check Dapr state store for existing cart
        const cart = await client.state.get(stateStoreName, `cart:${uid}`);
        let updatedCartItems: any = [];

        if (cart) {
            updatedCartItems = cart;

            const existingItem = updatedCartItems.find(item => item.product_id === product_id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                updatedCartItems.push({product_id, quantity});
            }
        } else {
            updatedCartItems = [{product_id, quantity}];
        }

        // Update Dapr state store
        await client.state.save(stateStoreName, [
            {
                key: `cart:${uid}`,
                value: updatedCartItems
            }
        ]);

        res.status(HttpStatusCode.CREATED).json(updatedCartItems);
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produkt konnte nicht hinzugefügt werden!'});
    }
};

const handleDeleteCartItem = async (req, res) => {
    try {
        const {uid, product_id} = req.body;

        // Check Dapr state store for existing cart
        const cartData = await client.state.get(stateStoreName, `cart:${uid}`);
        const cart: any = cartData;

        if (cart.length > 0) {
            const updatedCartItems = cart.filter(item => item.product_id !== product_id);

            if (updatedCartItems.length === cart.length) {
                return res.status(HttpStatusCode.NOT_FOUND).json({message: 'Produkt konnte im Warenkorb nicht gefunden werden!'});
            }

            // Update Dapr state store
            await client.state.save(stateStoreName, [
                {
                    key: `cart:${uid}`,
                    value: updatedCartItems
                }
            ]);

            res.status(HttpStatusCode.OK).json({
                message: 'Produkt wurde aus dem Warenkorb entfernt!',
                updatedCartItems
            });
        } else {
            res.status(HttpStatusCode.NOT_FOUND).json({message: 'Produkt konnte im Warenkorb nicht gefunden werden!'});
        }
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produkt konnte nicht aus dem Warenkorb entfernt werden!'});
    }
};

// This is the publisher
const handlePublishProcessOrder = async (req, res) => {
    try {
        const cartData = await client.state.get(stateStoreName, `cart:${req.body.uid}`);

        if (cartData && cartData.length === 0) {
            return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({message: 'Warenkorb ist leer und konnte deshalb nicht gepublished werden!'});
        }

        const data = {
            uid: req.body.uid,
            cart: cartData
        }

        await axios.post(`${daprHost}:${daprPort}/v1.0/publish/order/process`, data);

        await client.state.save(stateStoreName, [
            {
                key: `cart:${req.body.uid}`,
                value: []
            }
        ]);

        return res.status(HttpStatusCode.OK).json({message: 'Bestellung wurde erfolgreich aufgegeben! Jetzt muss die Bestellung nur noch genehmigt werden!'});
    } catch (error) {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message: 'Produkt konnte nicht aus dem Warenkorb entfernt werden!'});
    }
}

const cartController = {
    handleGetCart,
    handleAddCartItem,
    handleDeleteCartItem,
    handlePublishProcessOrder
}

export default cartController;