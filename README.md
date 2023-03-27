# All IELTS General Words
- allWords.txt has all the 9000 words that appear in General IELTS(10-16) listening and reading
- allKeyWords.txt has all the 5300 words that appear in more than once of General IELTS(10-16) listening and reading
- allTrivalWords.txt has all the 3500 words that appear in only once of General IELTS(10-16) listening and reading
- listeningOnly.txt has all the 5700 words that hasn't appear in Listening part
- readingOnly.txt has all the 3000 words that hasn't appear in Listening part
- allWordGroups.txt has all word groups that appear more than 5 times
- so only review these words is enough

# Facts about All IELTS Words
- IELTS band 9 actually only require around 4000 key words
- IELTS band 9 has at most 9000 words required, even when considering the variation of the keywords

# Ref
- [https://ieltsprogress.com/ielts-1-16-listening-test-transcripts/](https://ieltsprogress.com/ielts-1-16-listening-test-transcripts/)
- [https://ieltsprogress.com/cambridge-reading-practice-tests/](https://ieltsprogress.com/cambridge-reading-practice-tests/)

# Dev 
- update any files inside data folder
- node index.js to compute words
- node temp.js to compute unique words from temp.txt to tempUnique.txt
- words.txt contains all valid word bigger than 2 characters(lowercase)
- outliers.txt contains all invalid word

# Couch DB (root 123456)
- install [couchdb](https://pouchdb.com/guides/setup-couchdb.html)
- http://localhost:5984/_utils/
- [https://pouchdb.com/api.html](https://pouchdb.com/guides/setup-couchdb.html)

# UI Dev
- npm start
