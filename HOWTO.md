# moveto
Extract data from moveto.com for any zip codes.

## 1. Checkout/fork the code

    git clone git@github.com:xgirma/moveto.git
    npm i

## 2. Clean
You need to clean the default data and workflow. Since the data has to match with your preferred zip code and a corrsponding workflow.

    npm run clean

## 3. Pages
moveto displays listing with page(s). Get how many pages a given zip code listing has. Use your zip instead.

    npm run pages -- --zip=28685

## 4. Links
Now iterate with each page(s) and scrap the listing links.workflow.

    npm run links -- --zip=28685

## 5. Houses
Now using the links for each listing we will scrap single family houses. Change the defaults values as needed.

    npm run houses  -- --zip=28685 --maxprice=500000 --beds=3 --baths=3


## 6. Classify
Classify the row data into for sale, coming soon, sale pending, and in contract csv files.

    npm run classify -- --zip=28685

## 7. Classify for sale
Classify for sale listings into price reduced, open house, and listed today csv files.

    npm run classify:sale -- --zip=28685

## 8. Summary
Get counts for coming soon, for sale, in contract, open house, price reduced, sale pending and all listings for sale.

    npm run summary

## 9. Readme
Now you can generate the README.md file. This file give a high level overview and links for the different data sets.

    npm run readme

## 10. Workflow
You can run Github Actions job which to scrap the data once a day. The workflow will run your test and commit the changes. That pulls fresh data everyday.

    npm run workflow

## 11. Sorting
You can sort results by price, size, year built or days listed. This will create a separate csv file per sort.

    npm run byprice -- --zip=28685
    npm run bysize -- --zip=28685
    npm run byyear -- --zip=28685
    npm run bydays -- --zip=28685
