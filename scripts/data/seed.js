const API_URL = process.env.API_URL || 'http://collector.local/api';

// Inject Host header when using port-forward (localhost) so nginx ingress routes correctly
if (API_URL.includes('localhost')) {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (url, options = {}) => {
        const headers = { ...(options.headers || {}), 'Host': 'collector.local' };
        return originalFetch(url, { ...options, headers });
    };
}


const users = [
    {
        name: 'Ash Ketchum',
        email: 'ash@pokemon.com',
        password: 'Collect0r!2026',
        role: 'seller',
        address: 'Bourg Palette, Kanto'
    },
    {
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        password: 'Collect0r!2026',
        role: 'seller',
        address: 'Manoir Wayne, Gotham City'
    },
    {
        name: 'Tony Stark',
        email: 'tony@stark.com',
        password: 'Collect0r!2026',
        role: 'seller',
        address: 'Stark Tower, New York'
    },
    {
        name: 'Collector Joe',
        email: 'joe@collect.com',
        password: 'Collect0r!2026',
        role: 'buyer',
        address: '123 Main St, Springfield'
    },
    {
        name: 'Richie Rich',
        email: 'richie@rich.com',
        password: 'Collect0r!2026',
        role: 'buyer',
        address: 'Rich Manor, Beverly Hills'
    },
    {
        name: 'Admin User',
        email: 'admin@collector.com',
        password: 'Collect0r!2026',
        role: 'admin',
        address: 'HQ, Admin City'
    }
];

const articlesData = {
    'ash@pokemon.com': [
        {
            title: 'Dracaufeu 1ère Edition Holographique',
            description: 'Carte Pokémon Dracaufeu du set de base, 1ère édition. État Mint (PSA 9). La pièce maîtresse de toute collection.',
            price: 15000,
            photos: ['https://cdn.ecardstore.fr/2024/11/high-res-image6-png.webp'],
            status: 'published'
        },
        {
            title: 'Game Boy Originale (1989)',
            description: 'Console Game Boy originale grise (DMG-01). Fonctionne parfaitement, écran sans rayures majeurs. Vendu avec Tetris.',
            price: 150,
            photos: ['https://p.turbosquid.com/ts-thumb/B9/Zg08BX/DXLjg84n/front/png/1588253792/600x600/fit_q87/ba60cf0d034b5ac083811a704658e63575a22cf2/front.jpg'],
            status: 'published'
        },
        {
            title: 'Pikachu Illustrator (Replica)',
            description: 'Reproduction de haute qualité de la célèbre carte Pikachu Illustrator via un artiste fan.',
            price: 50,
            photos: ['https://i.etsystatic.com/39266313/r/il/0c10a3/5274156626/il_fullxfull.5274156626_a7n7.jpg'],
            status: 'published'
        },
        {
            title: 'Boite Booster Set de Base (Scellée)',
            description: 'Boite de 36 boosters Pokémon Set de Base, édition 1999 (Wizards of the Coast). Scellée d\'origine.',
            price: 25000,
            photos: ['https://i.ebayimg.com/images/g/CX8AAOSwfJ5jv19s/s-l400.jpg'],
            status: 'published'
        }
    ],
    'bruce@wayne.com': [
        {
            title: 'Action Comics #1 (Réédition 1990)',
            description: 'Réédition officielle du premier comic Superman. État neuf sous blister.',
            price: 80,
            photos: ['https://moesbooks.cdn.bibliopolis.com/pictures/94827.jpg'],
            status: 'published'
        },
        {
            title: 'Batmobile 1989 Hot Toys',
            description: 'Modèle réduit 1/6 de la Batmobile du film de Tim Burton. Détails incroyables, lumières fonctionnelles.',
            price: 650,
            photos: ['https://1.bp.blogspot.com/-aqZUgHCH144/Ue2mpkSODOI/AAAAAAAAB4s/zYY_6FfV4VM/s1600/24.jpg'],
            status: 'published'
        },
        {
            title: 'Batarang Prop Replica',
            description: 'Réplique grandeur nature du Batarang utilisé dans The Dark Knight. En métal, avec socle d\'exposition.',
            price: 120,
            photos: ['https://www.imaginationhobby.com/images/detailed/159/the-batman-batarang_dc-comics_gallery_620d9e41b23c7.jpg'],
            status: 'published'
        }
    ],
    'tony@stark.com': [
        {
            title: 'Casque Iron Man Mark III',
            description: 'Réplique portable du casque Mark III. Interface HUD simulée, commande vocale pour l\'ouverture.',
            price: 450,
            photos: ['https://preview.redd.it/66n0p3upnge31.jpg?width=1080&crop=smart&auto=webp&s=7da3830be594ce35ad68d66678a3865a1529adf6'],
            status: 'published'
        },
        {
            title: 'Gant de l\'Infini (Hasbro Legends)',
            description: 'Gant électronique articulé avec pierres lumineuses et sons du film Avengers: Infinity War.',
            price: 110,
            photos: ['https://media.cdnws.com/_i/285672/33076/3649/76/objet-collection-gant-thanos-infinity-gauntlet-avengers-marvel-legends-series-hasbro-5.jpeg'],
            status: 'published'
        },
        {
            title: 'Figurine Hulkbuster',
            description: 'Figurine massive de 50cm, très détaillée.',
            price: 300,
            photos: ['https://i.ebayimg.com/images/g/aroAAOSwReBhzSwt/s-l1200.png'],
            status: 'published'
        },
        {
            title: 'Arc Reactor (Proof That Tony Stark Has A Heart)',
            description: 'Réplique exacte du premier réacteur ARK offert par Pepper Potts.',
            price: 200,
            photos: ['https://i.ebayimg.com/images/g/2DkAAOSwgXNhdknE/s-l400.jpg'],
            status: 'published'
        }
    ]
};

async function main() {
    console.log(`🌱 Seeding enhanced data to ${API_URL}...`);

    // Configurable waiting time to ensure services are responsive
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const userTokens = {};

    // 1. Create Users
    console.log("\n--- Creating Users ---");
    for (const user of users) {
        try {
            process.stdout.write(`Processing user ${user.email}... `);
            let token = null;
            let userId = null;

            // Try login
            const loginRes = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, password: user.password })
            });

            if (loginRes.ok) {
                const data = await loginRes.json();
                token = data.token || data.access_token;
                userId = data.user.id;
                console.log(`Logged in ✅`);
            } else {
                // Register
                const regRes = await fetch(`${API_URL}/users/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(user)
                });

                if (!regRes.ok) {
                    const err = await regRes.text();
                    console.log(`Failed to register ❌ (${err})`);
                    continue;
                }

                const regData = await regRes.json();
                token = regData.token;
                userId = regData.user.id;
                console.log(`Registered ✅`);
            }

            if (token && userId) {
                userTokens[user.email] = { ...user, token, id: userId };
            }

        } catch (error) {
            console.log(`Error ❌: ${error.message}`);
        }
    }

    // 2. Create Articles
    console.log("\n--- Creating Articles ---");

    for (const [email, articles] of Object.entries(articlesData)) {
        const seller = userTokens[email];

        if (!seller) {
            console.log(`Skipping articles for ${email} (Seller not found/no token)`);
            continue;
        }

        console.log(`\nCreating inventory for ${seller.name} (${email}):`);

        for (const article of articles) {
            try {
                process.stdout.write(`  - ${article.title}... `);

                const payload = {
                    ...article,
                    sellerId: seller.id
                };

                const res = await fetch(`${API_URL}/articles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${seller.token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    console.log(`Created ✅`);
                } else {
                    const err = await res.text();
                    console.log(`Failed ⚠️ (${err})`);
                }

                // Small delay to prevent overwhelming if many items
                await delay(100);

            } catch (error) {
                console.log(`Error ❌: ${error.message}`);
            }
        }
    }

    console.log(`\n✨ Seeding completed!`);
}

main();
