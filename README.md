# Degiro-Portfolio-Manager

This is a simple Portfolio tracker that doesn't need you account logins or api keys to import data.
The only thing this application needs is just an account statement report that you manually can extract from your
Degiro account.

That report includes all the activity that goes on your account (including the flatex bank account) and all the hidden
fees that you don't see daily.

This tool aspires to shed some light over theses hidden transactions, and also it is meant to be an easier way to
inspect your profile, check open and closed positions and help you fill your investment taxes.

Because this tool is pure javascript it can run right on your browser, and it will never send your account statement
anywhere! you can check that is this github repository.

This tool is still under development and there is a big list of work left to do, take that into consideration when trying it

[Try the tool at this URL](https://stocks-tax-manager.massadas.com/)

## Application screenshots
Home Page
![Home Page](https://github.com/G4brym/Degiro-Portfolio-Manager/raw/main/docs/home.png)

Open Positions
![Home Page](https://github.com/G4brym/Degiro-Portfolio-Manager/raw/main/docs/open_positions.png)

Closed Positions
![Home Page](https://github.com/G4brym/Degiro-Portfolio-Manager/raw/main/docs/closed_positions.png)

Commissions
![Home Page](https://github.com/G4brym/Degiro-Portfolio-Manager/raw/main/docs/commissions.png)


## TODO
 - ~~Breakdown commissions into more details~~
 - ~~Calculate "current" PL for open positions~~
 - ~~Export all generated lists to csv~~
 - Select the fiscal year to see positions + commissions
 - List Dividend transactions
 - List general account movements (deposits/withdraws)
 - ~~Take commissions into consideration when calculating a position PL~~
 - ~~Support multiple report languages (we parse a lot of descriptions and degiro translates some of them)~~
 - Support column sorting

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
