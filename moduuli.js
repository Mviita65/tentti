const onkoLukuja=(x)=>{
    
    x.every(item=>{
        return typeof item=='number'
    })
}

const merkkaaLöydetytKirjaimet=(arvatutKirjaimet, sananKirjaimet)=>{
    let alaviivaSana=[]
    for(const[index,sananKirjain] of sananKirjaimet.entries()) {
        alaviivaSana.push("_")
        for(arvattuKirjain of arvatutKirjaimet) {
            if (arvattuKirjain==sananKirjain){
                alaviivaSana[index]=arvattuKirjain
            }
        }
    }
    return alaviivaSana
}

const merkkaaLöydetytKirjaimet2=(arvatutKirjaimet, sananKirjaimet)=>{
    let viivat=[]
    arvatutKirjaimet.reduce((acc, arvattuKirjain) => {
        return sananKirjaimet.map((sananKirjain,index) => {
            if (sananKirjain==arvattuKirjain) {
                return sananKirjain
            } else {
                if (acc[index]!=='_') {
                    return acc[index]
                } else {
                    return '_'
                }
            }
        })
    },viivat.fill('_'))
}

console.log(merkkaaLöydetytKirjaimet(['a','e','y'],['k','i','s','s','a']))

const summa=(a,b)=>{
    if (onkoLukuja([a,b])) {
        return a+b;
    } else {
        return "anna appelsiineja"
    }
}

const tulo=(a,b)=>{
    return a*b;
}

module.exports = {
    summa : summa,
    tulo : tulo,
    merkkaaLöydetytKirjaimet : merkkaaLöydetytKirjaimet,
    merkkaaLöydetytKirjaimet2 : merkkaaLöydetytKirjaimet2
}