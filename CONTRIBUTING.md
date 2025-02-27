# Contributing Protocol
⭐️ Star the repository 😎

See [Getting Started](https://github.com/1111philo/apolis-app/tree/main?tab=readme-ov-file#getting-started) to get up and running.

## Create an Issue and Local Branch
[Report Bug](https://github.com/1111philo/apolis-app/issues/new?template=bug_report.md) &middot; [Request Feature](https://github.com/1111philo/apolis-app/issues/new?template=feature_request.md)

Create an issue with one of the above links. Assign yourself to it so that we know you're working on it.

Locally, create a working branch off of the `staging` branch, following the template:
```sh
<username>/i-<issue number>-<short action OR issue-description>
```
Examples:
```sh
squidward8/i-123-add-reactive-dropdown
squidward8/i-124-fix-dropdown
```

## Submit Changes

After working on your local working branch
- push to `origin/<your-working-branch>`
- [submit a PR](https://github.com/1111philo/apolis-app/pulls) to merge your branch into the '[staging](https://github.com/1111philo/apolis-app/tree/staging)' branch.

We will review the changes, request changes if needed, then approve and merge.

Please delete your working branch once it is merged into `staging`.

**🎉 Thank you for contributing!! 🎉**

## Additional

### Live Staging
- The staging url is [apolis.dev](https://apolis.dev).
- Deployment to this url is triggered upon merge to the [staging](https://github.com/1111philo/apolis-app/tree/staging) branch. 
- Once the Github action completes, you will see your changes reflected here.
- Use these [credentials](https://github.com/1111philo/apolis-app/tree/main?tab=readme-ov-file#user-credentials-for-development) to log into the staged app.

### Production
The production url is [apolis.app](https://apolis.app). Deployment to this url is triggered upon merge to the main branch.