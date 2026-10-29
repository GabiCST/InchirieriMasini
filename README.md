<details open>
<summary>English</summary>

# Car Rental Management System

## Overview

This is a full-stack web application for a car rental business. The frontend is built with React, and the backend is powered by a C# ASP.NET Core Web API. The system uses JSON Web Tokens (JWT) for secure, role-based authentication. Users can browse the fleet and rent cars, while administrators can manage vehicles, process rental contracts, and automatically generate PDF invoices. Database operations are handled via OLE DB.

## Key Features

### Authentication & Security

* **Secure Login & Registration:** Uses bcrypt for password hashing and JWT for session management.
* **Role-Based Access:** Distinct privileges for `User` and `Admin` accounts.

### User Features

* **Fleet Browsing:** View available cars, prices, specifications, and rental conditions.
* **Car Rental:** Select rental dates and automatically calculate the total estimated cost to create a rental contract.
* **Contract History:** View personal rental history and cancel pending reservations.
* **Profile Management:** Update personal details, address, and driver's license information required for renting.

### Administrator Features

* **Fleet Management:** Add, edit, or remove cars. Manage specifications, features, and track the accident/repair history for each vehicle.
* **Contract Processing:** Approve or reject rental requests. 
* **Financial Tracking:** Register advance payments and final payments (including penalties).
* **PDF Generation:** Automatically generate professional PDF documents (handover protocols and final invoices) using QuestPDF.

## Technical Details

* **Frontend:** React (React Router for navigation, standard CSS).
* **Backend API:** C# ASP.NET Core.
* **Database:** OLE DB (`System.Data.OleDb`) for database connections (supports MS Access or SQL Server).
* **Document Generation:** QuestPDF for backend PDF creation.
* **Authentication:** JWT (JSON Web Tokens).

## Setup Instructions

1. **Prerequisites:**
   * Node.js (for the React frontend).
   * .NET SDK (for the ASP.NET Core backend).
   * A compatible database (e.g., MS Access `.accdb`) with the required schema (Users, Cars, Contracts, Invoices, Events).

2. **Backend Configuration:**
   * Navigate to the backend project folder.
   * Update the `appsettings.json` file with your JWT Secret Key and Database Connection String:
     ```json
     {
       "Jwt": {
         "Key": "Your_Super_Secret_Key_Here_Minimum_32_Chars"
       },
       "ConnectionStrings": {
         "ServiceDb": "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=YourDatabasePath.accdb;"
       }
     }
     ```
   * Run the API using Visual Studio or the command line (`dotnet run`).

3. **Frontend Configuration:**
   * Navigate to the frontend project folder (where `package.json` is located).
   * Install dependencies: `npm install`
   * Start the React development server: `npm start` (or `npm run dev` if using Vite).

</details>

<details>
<summary>Română</summary>

# Sistem pentru Închirieri Auto

## Prezentare generală

Aceasta este o aplicație web full-stack pentru o firmă de închirieri auto. Partea de frontend este construită cu React, iar backend-ul folosește C# ASP.NET Core Web API. Sistemul utilizează JSON Web Tokens (JWT) pentru autentificare sigură pe bază de roluri. Utilizatorii pot explora mașinile și le pot închiria, în timp ce administratorii gestionează flota, procesează contractele și generează automat facturi în format PDF. Baza de date este accesată prin OLE DB.

## Funcționalități principale

### Autentificare și Securitate

* **Autentificare și Înregistrare:** Folosește bcrypt pentru criptarea parolelor și JWT pentru menținerea sesiunii.
* **Control al Accesului:** Drepturi diferite pentru conturile de tip `User` (Utilizator) și `Admin` (Administrator).

### Funcționalități pentru Utilizatori

* **Explorare Flotă:** Vizualizarea mașinilor disponibile, a prețurilor, dotărilor și condițiilor de închiriere.
* **Închiriere Auto:** Selectarea perioadei cu calcularea automată a costului estimat și trimiterea cererii de închiriere.
* **Istoric Contracte:** Vizualizarea propriilor închirieri și posibilitatea de a anula rezervările în așteptare.
* **Gestiune Profil:** Actualizarea datelor personale, a adresei și a informațiilor despre permisul de conducere.

### Funcționalități pentru Administratori

* **Gestiune Flotă:** Adăugarea, modificarea sau ștergerea mașinilor. Gestionarea dotărilor și ținerea evidenței daunelor/evenimentelor rutiere pentru fiecare vehicul.
* **Procesare Contracte:** Aprobarea sau respingerea cererilor de închiriere.
* **Gestiune Financiară:** Înregistrarea avansului la predarea mașinii și a restului de plată (plus eventuale penalizări) la returnare.
* **Generare PDF:** Crearea automată a proceselor verbale de predare/primire și a facturilor în format PDF folosind QuestPDF.

## Detalii Tehnice

* **Frontend:** React (React Router pentru navigare, CSS standard).
* **Backend API:** C# ASP.NET Core.
* **Bază de date:** OLE DB (`System.Data.OleDb`) pentru conectare (compatibil cu MS Access sau SQL Server).
* **Generare Documente:** QuestPDF pentru crearea fișierelor PDF pe server.
* **Autentificare:** JWT (JSON Web Tokens).

## Instrucțiuni de Instalare

1. **Cerințe necesare:**
   * Node.js (pentru frontend-ul React).
   * .NET SDK (pentru backend-ul ASP.NET Core).
   * O bază de date compatibilă (ex. MS Access `.accdb`) cu structura necesară (Utilizatori, Mașini, Contracte, Facturi, Evenimente).

2. **Configurare Backend:**
   * Mergi în folderul proiectului backend.
   * Modifică fișierul `appsettings.json` pentru a adăuga cheia secretă JWT și calea către baza de date:
     ```json
     {
       "Jwt": {
         "Key": "Cheia_Ta_Secreta_Aici_Minim_32_Caractere"
       },
       "ConnectionStrings": {
         "ServiceDb": "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=CaleaCatreBazaDeDate.accdb;"
       }
     }
     ```
   * Pornește API-ul din Visual Studio sau din terminal (`dotnet run`).

3. **Configurare Frontend:**
   * Mergi în folderul proiectului frontend (unde se află `package.json`).
   * Instalează dependențele: `npm install`
   * Pornește serverul React: `npm start` (sau `npm run dev` dacă folosești Vite).

</details>
