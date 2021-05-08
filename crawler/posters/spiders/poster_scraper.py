from scrapy import Spider
from csv import DictReader, DictWriter
from urllib.parse import urlencode, urljoin
from urllib.request import urlopen

from scrapy.http.request import Request

class PosterSpider(Spider):
    name = 'posters'
    imdb_url = 'https://www.imdb.com/'

    def start_requests(self):
        fieldnames = ['movieId', 'title', 'genres']
        with open('movies.csv', newline='') as f:
            reader = DictReader(f, fieldnames=fieldnames)
            for row in reader:
                query = urlencode({
                    'q': row['title'],
                    's': 'tt',
                })
                yield Request(
                    f'{self.imdb_url}find?{query}',
                    callback=self.parse_search_result,
                    cb_kwargs={'movieId': row['movieId']}
                )

    def parse_search_result(self, response, movieId):
        item = {'movieId': movieId}
        try:
            movie_link = (
                response.css('table.findList')
                .css('tr')
                .css('a')
                .attrib['href']
            )

            url = urljoin(self.imdb_url, movie_link)
        except KeyError:
            url = ''

        item['movie_url'] = url

        yield response.follow(
            url,
            callback=self.parse_movie_page,
            cb_kwargs={'item': item},
        )


    def parse_movie_page(self, response, item):
        try:
            poster = (
                response.css('div.poster img')
                .attrib['src']
            ) if item['movie_url'] else ''
            director = (response.css
            ('div.credit_summary_item a::text').get()) 
            if item['movie_url'] else ''
        except KeyError:
            poster = ''
            director = ''

        item['poster'] = poster
        item['director'] = director
        yield item