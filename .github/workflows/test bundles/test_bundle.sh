node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default;
if [ $? -ne 2 ]; then exit 1; fi

# ensure that exactly 2 requests are failing, and the rest work as expected
