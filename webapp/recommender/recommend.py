import pandas as pd
import sys
import json
from vectorize import vectorize

def movie_recommend(title):
    cosine_similarities, movie_title, indices = vectorize()

    idx = indices[title]
    sim_scores = list(enumerate(cosine_similarities[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:31]

    movie_indices = [i[0] for i in sim_scores]

    print(movie_title.iloc[movie_indices].to_json())
    return movie_title.iloc[movie_indices].to_json()


def main():
    movie_recommend(sys.argv[1])
    sys.stdout.flush()

if __name__ == '__main__':
    main()