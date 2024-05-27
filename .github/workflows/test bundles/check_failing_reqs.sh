# ensure that the expected requests are failing

node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default --req tests-negative-response;
exitCode=$?
if [ $exitCode -ne 1 ]; then
    echo "exit code is $exitCode, expected 1";
    exit $exitCode; 
fi

node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb --env default --req tests-negative-schema;
exitCode=$?
if [ $exitCode -ne 1 ]; then
    echo "exit code is $exitCode, expected 1";
    exit $exitCode; 
fi

