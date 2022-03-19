import * as functions from "firebase-functions"
import { DataSnapshot } from "firebase-functions/v1/database"
const nodemailer = require('nodemailer')
require('dotenv').config()

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

function calling(){
    client.calls
            .create({
                twiml: '<Response><Say>Online Order!</Say></Response>',
                timeLimit: 15,
                to: process.env.TO_NUMBER!,
                from: process.env.FROM_NUMBER!
            }).then((call) => console.log(call.sid))
}

function sendEmail(snapshot: DataSnapshot){

    const mailOption = {
        from: '<noreply@domain.com>',
        to: process.env.TO_EMAIL!,
        subject: 'Order',
        html: getTemplate(snapshot)
    }
    
    calling()
    transporter.sendMail(mailOption)
}


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.USER_EMAIL!,
        pass: process.env.PASSWORD_EMAIL!
    }
})

export const onOrderCreate = functions.database
    .ref('Orders/{orderId}')
    .onCreate((snapshot, context) => {
        return sendEmail(snapshot)
    })

function getTemplate(snapshot: DataSnapshot){
    var value = snapshot.val()
    var customer = value.customer
    var order = value.order

    var html = 
    `<div>
        

    <div>
    <p>${customer.name}</p>
    <p>${customer.email}</p>
    <p>${customer.phone}</p>
    </div>

    <div>
    <table>  
    ${
        order.orderedItems.map(item => 
            `<tr>
            <td>
            ${item.id}
            </td>
            <td>
            ${item.name}
            </td>
            <td>
            ${item.quantity}
            </td>
            <td>
            ${item.price}
            </td>
            </tr>
        
            <tr>
            <td>${item.comment}</td>
            </tr>`)

    }

    </table>
    </div>


    <div>
    <table>
    <tr>
    <td>Comment: ${order.comment}</td>
    </tr>
    <tr>
    <td>Subtotal: ${order.subtotal}</td>
    </tr>
    <tr>
    <td>Total: ${order.total}</td>
    </tr>
    
    </table>
    </div>

    </div>
    `
    return html
}
