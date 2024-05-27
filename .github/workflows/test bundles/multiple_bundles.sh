# ensure that multiple bundles can be run 
node ./dist/index.js ./.github/workflows/test\ bundles/tests-bundle.zzb ./.github/workflows/test\ bundles/second-bundle.zzb --env default
exitCode=$?
if [ $exitCode -ne 2 ]; then
    echo "exit code is $exitCode, expected 2";
    exit $exitCode; 
fi