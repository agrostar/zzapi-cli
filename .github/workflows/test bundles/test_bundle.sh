node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default;
exitCode=$?
if [ $exitCode -ne 2 ]; then
    echo "exit code is $exitCode, expected 2";
    exit $exitCode; 
fi

# ensure that exactly 2 requests are failing, and the rest work as expected
