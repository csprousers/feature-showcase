<? string readme_url = "https://raw.githubusercontent.com/csprousers/cspro/refs/heads/dev/README.md"; ?>

The readme from the CSPro open source repository will be fetched and rendered below.

The action CS.Network.fetchText will embed the contents of the readme into this report,
accessing the readme from: [~~readme_url~~](~~readme_url~~)

Everything following this line is from the network request.

---

~~~ CS.Network.fetchText(url := readme_url) ~~~
