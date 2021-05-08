# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from csv import DictWriter


class PostersPipeline:
    def open_spider(self, spider):
        fieldnames = ['movieId', 'movie_url', 'poster', 'director']
        self.file = open('movies_info.csv', 'w', newline='')
        self.csv_writer = DictWriter(self.file, fieldnames=fieldnames)
        self.csv_writer.writeheader()

    def close_spider(self, spider):
        self.file.close()

    def process_item(self, item, spider):
        self.csv_writer.writerow(item)
        return item