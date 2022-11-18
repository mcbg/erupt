import { mouseover } from './mouseover.js'

function makeStatNode (sidebar, stat, lab, decimals=0, last=false) {
    const s = last ? '' : 'mr-2'
    const node = sidebar.append('div')
        .attr('class', 'w-33 text-center  py-2 px-3 cocktail-stat ' + s)
        .append('h3')
    node.append('span')
        .text((stat * 100).toFixed(decimals) + '%')
    node.append('small')
        .attr('class', 'text-muted')
        .html('<br/>' + lab)

}

// e: event
// d: cocktail object
// state: state
export function neighbours(e, d, state) {
    const dist = (d1, d2) => Math.sqrt((d1.pc1 - d2.pc1)**2 + (d1.pc2 - d2.pc2)**2)
    const pcSorted = state.ds.slice()
    pcSorted.sort((x,y) => dist(x, d) - dist(y, d))

    const sort_ingredients =(a, b) => d3.descending(a.vol, b.vol) || d3.descending(a.abv, b.abv)
    const sub = pcSorted.slice(0,5)
    const selected = sub[0]
    state.setSelected(selected)
    const ingredients = state.ingredient_list.filter(d => d.cocktail === selected.name)
            .sort(sort_ingredients)
    // cocktail header
    const sidebar = d3.select('#sidebar')
    const mouseover_f = mouseover(state)
    sidebar.html("") // delete all

    sidebar.append('h2')
        .attr('class', 'text-center')
        .text(sub[0].name.toUpperCase())

    // stats
    const stats = state.cocktailStats.filter(d => selected.name === d.name)[0]

    const statDiv = sidebar.append('div')
          .attr('class', 'd-flex justify-content-center mt-3')

    makeStatNode(statDiv, stats.abv, 'ABV')
    makeStatNode(statDiv, stats.sugar, 'SUGAR')
    makeStatNode(statDiv, stats.acid, 'ACID', 1, true)

    // cocktails list
    sidebar.append('h3')
        .text('Ingredients')
        .attr('class', 'header-mark mt-3 px-2')

    // ingredients
    sidebar.append('div')
        .selectAll('p.ingredient')
        .data(ingredients, d=>d.name)
        .enter()
            .append('p')
            .attr('class', 'ingredient px-2')
            .text(d=> d.value + " " + d.name)


    sidebar.append('h3')
        .attr('class', 'header-mark mt-4 px-2')
        .text('Neighbours')

    const nbrs = sidebar
        .append('div')
          .attr('class', 'neighbour-sidebar')
        .selectAll('div.neighbour')
        .data(sub.slice(1,5), (d, i) => i)
            .enter()
            .append('div')
            .attr('class', 'neighbour px-2 pb-0 m-0')

    state.setNeighbours(nbrs)

    // mouse over of neighbours (sidebar)
    nbrs
        .on('mouseleave', () => {
            d3.select(".neighbour-sidebar")
                .selectAll('div.neighbour')
                .style("background", "#fff")
            d3.select('#graph-svg')
                .selectAll('text.cocktail-label')
                .data(state.ds, state.keyLambda)
                .transition()
                .text(d => d.name === state.selected.name ? d.name : "")
            d3.select('#graph-svg')
                .selectAll('circle.point')
                .data(state.ds, state.keyLambda)
                .attr('opacity', 1)
        })
        .on('click', (e, nb) => {
            neighbours(e, nb, state)
        })
        .on('mouseenter', mouseover_f)

    const neighdiv = nbrs
        .append('p').text(d => d.name)

    neighdiv.append('br')
    neighdiv.append('small')
        .attr('class', 'text-muted')
        .text(d => {
            const s = state.ingredient_list
                .filter(o => o.cocktail === d.name)
                .sort(sort_ingredients)
                    .map(o => o.value.replace(" ","\u00A0") + "\u00A0" + o.name.replace(" ", "\u00A0"))
                .reduceRight((a,b)=> a === "" ? b : b + ", " + a, "")
            return s
        })

    nbrs.exit()
        .remove()

    nbrs.order()

    // update graph
    const isNeighbour = d => sub.map(d => d.name).includes(d.name)

    state.ds.sort((x,y) => isNeighbour(x) - isNeighbour(y)) // ensure neighbours are on top
    const points = d3.select('#graph-svg')
        .selectAll('circle.point')
        .data(state.ds, state.keyLambda)
        .attr('opacity', 1)

    points.transition("newColours")
        .attr('r', d => isNeighbour(d) ? 10 : 10)
        .attr('fill', d => d.name === selected.name ? state.colours.selected :  (isNeighbour(d) ? state.colours.neighbour : state.colours.neutral))
        .attr('opacity', 1)

    points.order()

    d3.select('#graph-svg')
        .selectAll('text.cocktail-label')
        .data(state.ds, state.keyLambda)
        .transition("newLabels")
            .text(d => d.name === selected.name ? d.name : '')
}
