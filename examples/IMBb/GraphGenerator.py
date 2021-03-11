import networkx as nx
from networkx.readwrite import json_graph
import csv
import json

with open('IMDb movies.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    headers = next(reader)
    nodes = []
    j = 0
    for row in reader:
        year = row[headers.index('year')]
        
        # for movies in year 2019
        if year.isnumeric() and int(year) == 2020:
            budget = str(row[headers.index('budget')])
            
            # if budget is recorded
            if len(budget) > 0 and budget[0] == '$':
                node = {}
                hasBlank = False
                i = 0
                
                for item in row:
                    if headers[i] in ["actors", "director", "writer", "genre", "country"]:
                        item.replace(" and ", ",")
                        arr = item.split(',')
                        item = []
                        for k in arr:
                            trimK = k.strip()
                            item.append(trimK)
                    
                    node[headers[i]] = item
                    if len(item) == 0:
                        hasBlank = True
                    i += 1

                if not hasBlank:
                    nodes.append((j, node))
                j += 1

    G = nx.Graph()
    G.add_nodes_from(nodes)
    for node_1 in G.nodes:
        for node_2 in G.nodes:
            if node_1 is not node_2:
                actor_list1 = G.nodes[node_1]["actors"]
                actor_list2 = G.nodes[node_1]["actors"]
                thisWeight = len(set(actor_list1) & set(actor_list2))
                if thisWeight != 0:
                    G.add_edge(node_1, node_2, shared_actors=thisWeight)

    data = json_graph.node_link_data(G)
    with open('IMDb.json', 'w') as jsonfile:
        json.dump(data, jsonfile)
