const API_URL = process.env.API_URL || 'http://collector.local/api';

const seller = {
    name: 'Test Seller',
    email: `seller_${Date.now()}@test.com`,
    password: 'Collect0r!2026',
    role: 'seller',
    address: 'Test Address'
};

const buyer = {
    name: 'Test Buyer',
    email: `buyer_${Date.now()}@test.com`,
    password: 'Collect0r!2026',
    role: 'buyer',
    address: 'Test Address'
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log(`🕵️‍♀️ Simulating Fraud Activity on ${API_URL}...`);

    try {
        // 1. Create & Login Seller
        console.log(`\nCreating Seller...`);
        let res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seller)
        });
        let data = await res.json();
        const sellerToken = data.token;
        const sellerId = data.user.id;
        console.log(`Seller created: ${seller.email}`);

        // 2. Create 5 Articles
        console.log(`\nCreating 5 Articles...`);
        const articles = [];
        for (let i = 1; i <= 5; i++) {
            const payload = {
                title: `Fraud Test Item ${i} - ${Date.now()}`,
                description: 'Test item for fraud detection',
                price: 100 + i,
                photos: ['https://via.placeholder.com/150'],
                sellerId: sellerId
            };

            res = await fetch(`${API_URL}/articles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sellerToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const art = await res.json();
                articles.push(art);
                process.stdout.write(`.`);
            } else {
                console.log(`Failed to create article: ${res.status}`);
            }
        }
        console.log(`\nCreated ${articles.length} articles.`);

        // 2.5 Simulate Excessive Price Changes
        console.log(`\nSimulating Excessive Price Changes...`);
        for (let i = 0; i < 2; i++) {
            const art = articles[i];
            const newPrice = art.price * 5; // multiply by 5 to trigger variation alert

            res = await fetch(`${API_URL}/articles/${art.id}/price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sellerToken}`
                },
                body: JSON.stringify({ price: newPrice })
            });

            if (res.ok) {
                console.log(`Changed price of "${art.title}" to ${newPrice}€ ✅`);
                art.price = newPrice; // update local object so the buyer buys at new price
            } else {
                console.log(`Failed to change price of "${art.title}": ${res.status}`);
            }
            await delay(200);
        }

        // 3. Create & Login Buyer
        console.log(`\nCreating Buyer...`);
        res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyer)
        });
        data = await res.json();
        const buyerToken = data.token || data.access_token;
        const buyerId = data.user.id;
        console.log(`Buyer created: ${buyer.email} (ID: ${buyerId})`);

        // 4. Buy 5 Articles
        console.log(`\nStarting 5 rapid purchase attempts...`);

        for (let i = 0; i < articles.length; i++) {
            const art = articles[i];
            const amount = Number(art.price);
            process.stdout.write(`Attempt ${i + 1}/${articles.length} on ${art.title} (${amount}€)... `);

            res = await fetch(`${API_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${buyerToken}`
                },
                body: JSON.stringify({
                    articleId: art.id,
                    buyerId: buyerId,
                    amount: amount
                })
            });

            if (res.ok) {
                console.log(`Initiated ✅`);
            } else {
                const err = await res.text();
                console.log(`Failed ⚠️ : ${res.status} - ${err}`);
            }

            await delay(200);
        }

        console.log(`\n✅ Simulation complete. Check Admin Dashboard for alerts.`);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
    }
}

main();
