
paypal.Buttons({
    // Sets up the transaction when a payment button is clicked
    async createOrder(data, actions) {
        const req = await fetch("/api/orders", {
            method: "POST",
            // use the "body" param to optionally pass additional order information
            // like product ids or amount
        })
        const res = await req.json()
        return res.id
        // .then((response) => response.json())
        // .then((order) => order.id );



    },
    // Finalize the transaction after payer approval
    async onApprove(data, actions) {
        return fetch(`/api/orders/${data.orderID}/capture`, {
            method: "POST",
        })
            .then((response) => response.json())
            .then((orderData) => {
                // Successful capture! For dev/demo purposes:
                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                var transaction = orderData.purchase_units[0].payments.captures[0];
                alert(`Transaction ${transaction.status}: ${transaction.id}

          See console for all available details
        `);
                // When ready to go live, remove the alert and show a success message within this page. For example:
                // var element = document.getElementById('paypal-button-container');
                // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                // Or go to another URL:  actions.redirect('thank_you.html');
            });
    },
})
    .render("#paypal-button-container");

function prueba() {
    setTimeout(() => {
        const button = document.querySelector('#submit-button')
        console.log(button)
    }, 4000)

}
