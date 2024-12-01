
(async () => {
    const BASE_URL = `http://127.0.0.1:${process.env.API_PORT}/api`
    const res1 = await fetch(`${BASE_URL}/ad-statistic/run`, {
        method: 'POST',
        headers: {
            'package-name': 'com.leleshuju.demo',
            'uuid': 'demo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            adId: '123',
            status: 2
        })
    })
    console.log(await res1.json())
    const res2 = await fetch(`${BASE_URL}/ad-statistic/status`, {
        method: "POST",
        headers: {
            'package-name': 'com.leleshuju.demo',
            'uuid': 'demo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            adId: '123'
        })
    })
    console.log(res2)
    const res3 = await fetch(`${BASE_URL}/ad-statistic/init`, {
        method: 'POST',
        headers: {
            'package-name': 'com.leleshuju.demo',
            'uuid': 'demo',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            adId: '123',
            status: 1
        })
    })
    console.log(res3)
})()
