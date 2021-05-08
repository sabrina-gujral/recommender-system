import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

def vectorize():
    df = pd.read_csv('./data/movies_complete.csv')
    df = df[['title', 'genres', 'movie_url', 'poster' , 'director']]
    df.dropna(inplace=True)
    df['bag'] = df['genres'] + '|' + df['director']

    tf = TfidfVectorizer(analyzer='word',
                         ngram_range=(1, 3),
                         min_df=0,
                         stop_words='english')
    matrix = tf.fit_transform(df['bag'])

    cosine_similarities = linear_kernel(matrix,matrix)
    movie_title = df
    indices = pd.Series(df.index, index=df['title'])
    return cosine_similarities, movie_title, indices
