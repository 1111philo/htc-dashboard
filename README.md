<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url] [![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url] [![project_license][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <!-- <a href="https://github.com/github_username/repo_name">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

<h3 align="center">apolis</h3>

  <p align="center">
    Guest, service, and data management app for the Harry Tompson Center, an outreach organization for the unhoused.
    <br />
    <a href="https://github.com/1111philo/apolis-app/issues/new?template=bug_report.md">Report Bug</a>
    &middot;
    <a href="https://github.com/1111philo/apolis-app/issues/new?template=feature_request.md">Request Feature</a>
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

The Harry Tompson Center in New Orleans, LA, US provides services for the unhoused. They regularly service 35,000+ visits and 4,000+ unique visitors every year. This app replaces their manual clipboard workflow, improving accuracy and ease of tracking their guests and impact in the community.

Live [staging deployment](https://apolis.dev/).

### Tech Stack

#### Frontend ([https://github.com/1111philo/apolis-app](https://github.com/1111philo/apolis-app))
- [React](https://react.dev/) based single page application
- File-based routing with [TanStack Router](https://tanstack.com/router/latest)
- [React-Bootstrap](https://react-bootstrap.github.io/) for UI components
- [Vite](https://vite.dev/) for building.
- Deployment: GitHub Actions to S3 and CloudFront

#### API ([https://github.com/1111philo/apolis-api](https://github.com/1111philo/apolis-api))
- [Node.js](https://nodejs.org/en) serverless functions on [AWS Lambda](https://aws.amazon.com/lambda/)
- Authentication: [Amazon Cognito](https://aws.amazon.com/pm/cognito/)
- Supports `GET` and `POST` requests

#### DB ([https://github.com/1111philo/apolis-db](https://github.com/1111philo/apolis-db))
- [PostgreSQL](https://www.postgresql.org/)
- SQL queries for local setup
#### video
- [Video overview of our stack as of 2/4/24](https://us06web.zoom.us/rec/share/L3O6v3vV6wljV0SJz87CeLvevRfK3V4z4Y5GlkSzXD4QPnjrApQiDk4xtUni1krd.2k59v7DioKcRWm9H) - also has general walkthrough of the app

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow the steps below.

### Prerequisites

Before running locally and/or working on **apolis**, you need installed:
- [git](https://git-scm.com/downloads)
- [node.js](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation) (or [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://yarnpkg.com/getting-started/install))

### Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/1111philo/apolis-app.git
   ```
2. Switch from the `main` branch to the `staging` branch. **This is the development branch, base all your working branches off** `staging`.
    ```sh
    git switch staging
    ```
3. Install npm packages:
   ```sh
   pnpm install
   ```
4. Run the app in the local staging environment:
   ```sh
   pnpm run start:staging
   ```

#### User credentials for development

**Users:** `admin@apolis.app`, `manager@apolis.app`,
**Pass:** `apolis` (works for all)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- INFO ON API -->
## API

The values located in `/.env.staging` and `/.env.production` are used to interact with the respective API (staging and production environments have their own API).

### Usage with Postman

See our Postman collection [here](https://docs.apolis.dev/).
The following steps are also covered in this [video](https://us06web.zoom.us/rec/share/z2HiTTEZ5q0Ebchj-eEwUpbwNeTWVv6TnLPBe8u3Z3VlvmbKriY4KUcyPHM7JK2K.RXsD-qNqN_CbaS6z) (passcode: \^D7^8@rh).

1. Download the collection (or run Postman in the browser) by clicking the "Run in Postman" button at the top right of the [docs page](https://docs.apolis.dev/).

**To send requests to the API, you must have an authentication token.**

2. Under `/Public`, send the `Get Auth Token` request. You will receive a response like this:
    ```json
    {
      "IdToken": "<string>",
      "RefreshToken": "<string>",
      "AccessToken": "<string>"
    }
    ```
3. Highlight the string value of the `IdToken` field (quotes not included), right click the selection, click "Set as variable", choose the `token` variable.
    > ⚠️ *if you don't see the* `token` *variable, ensure you are working in the* `Staging` *environment (there's a dropdown at the top right in the Postman app to choose the environment)*
4. You are now authorized to send any API requests under the `/Auth` folder.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

See our [CONTRIBUTING.md](https://github.com/1111philo/apolis-app/blob/main/CONTRIBUTING.md).


### Top contributors:

<a href="https://github.com/1111philo/apolis-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=1111philo/apolis-app" alt="contrib.rocks image" />
</a>


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/1111philo/apolis-app/issues) for a full list of proposed features (and known issues).




<!-- LICENSE -->
## License

See [LICENSE](https://github.com/1111philo/apolis-app/blob/main/LICENSE).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/1111philo/apolis-app.svg?style=for-the-badge
[contributors-url]: https://github.com/1111philo/apolis-app/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/1111philo/apolis-app.svg?style=for-the-badge
[stars-url]: https://github.com/1111philo/apolis-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/1111philo/apolis-app.svg?style=for-the-badge
[issues-url]: https://github.com/1111philo/apolis-app/issues
[license-shield]: https://img.shields.io/github/license/1111philo/apolis-app.svg?style=for-the-badge
[license-url]: https://github.com/1111philo/apolis-app/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[React-bootstrap.com]: https://img.shields.io/badge/React-Bootstrap?style=for-the-badge&logo=reactbootstrap&color=%23712DF9
[React-bootstrap-url]: https://react-bootstrap.github.io/
[postgres-badge]: https://img.shields.io/badge/Postgres-%2523316192.svg?style=for-the-badge&logo=postgresql&logoColor=white&color=%234169E1
[postgres-url]: https://www.postgresql.org/
[github-actions-badge]: https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white&color=%232088FF
[github-actions-url]: https://github.com/features/actions