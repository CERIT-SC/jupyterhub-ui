import asyncio
import os
import re
from collections import defaultdict

import escapism
from kubespawner import KubeSpawner
from tornado import web
from traitlets import Unicode, List, Dict

JHENV = os.environ.get("JH_ENV", "dev")


class DockerImageChooser(KubeSpawner):
    homes = List(
        trait=Unicode(),
        default_value=['brno12-cerit'],
        minlen=1,
        config=True,
        help="Mountpoints for homes."
    )

    simple = Dict(config=True)
    ro = Dict(config=True)
    tfo = Dict(config=True)
    matlab = Dict(config=True)
    various = Dict(config=True)
    folding = Dict(config=True)

    form_template_script = Unicode(f"""
      <script>
        function customGpuCheck(that) {{
          if (document.getElementById("gpuid").value.startsWith("mig")) {{
            document.getElementById("migamount").style.display = "block";
          }} else {{
            document.getElementById("migamount").style.display = "none";
          }}
        }}

        function showHomeOptions() {{
          if (document.getElementById("homecheck").checked) {{
            document.getElementById("customHome").style.display = "block";
          }} else {{
            document.getElementById("customHome").style.display = "none";
          }}
        }}

        function showS3Options() {{
          if (document.getElementById("s3check").checked) {{
            document.getElementById("s3select").style.display = "block";
          }} else {{
            document.getElementById("s3select").style.display = "none";
          }}
        }}

        function showS3TypeOptions() {{
          if (document.getElementById("ss3id").value === "new") {{
            document.getElementById("s3urldiv").style.display = "block";
            document.getElementById("s3bucketdiv").style.display = "block";
            document.getElementById("s3accesskeydiv").style.display = "block";
            document.getElementById("s3secretkeydiv").style.display = "block";
            document.getElementById("s3names").style.display = "none";
          }} else {{
            document.getElementById("s3names").style.display = "block";
            document.getElementById("s3urldiv").style.display = "none";
            document.getElementById("s3bucketdiv").style.display = "none";
            document.getElementById("s3accesskeydiv").style.display = "none";
            document.getElementById("s3secretkeydiv").style.display = "none";
          }}
        }}

        function showImageOptions() {{
          if (document.getElementById("simplenb").checked) {{
            document.getElementById("simplenblist").style.display = "block";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
          if (document.getElementById("rnb").checked) {{
            document.getElementById("rnblist").style.display = "block";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
          if (document.getElementById("tfnb").checked) {{
            document.getElementById("tfnblist").style.display = "block";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
          if (document.getElementById("matlabnb").checked) {{
            document.getElementById("matlabnblist").style.display = "block";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
          if (document.getElementById("variousnb").checked) {{
            document.getElementById("variousnblist").style.display = "block";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
          if (document.getElementById("foldingnb").checked) {{
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("custom").style.display = "none";
            document.getElementById("foldingnblist").style.display = "block";
          }}
          if (document.getElementById("customnb").checked) {{
            document.getElementById("custom").style.display = "block";
            document.getElementById("variousnblist").style.display = "none";
            document.getElementById("simplenblist").style.display = "none";
            document.getElementById("tfnblist").style.display = "none";
            document.getElementById("matlabnblist").style.display = "none";
            document.getElementById("rnblist").style.display = "none";
            document.getElementById("foldingnblist").style.display = "none";
          }}
        }}

        function getHomesFromKubernetes() {{
          if (document.getElementById("existing").checked) {{
            document.getElementById("pvcnames").style.display = "block";
            document.getElementById("phomeDiv").style.display = "none";
          }}
          if (document.getElementById("new").checked) {{
            document.getElementById("pvcnames").style.display = "none";
            document.getElementById("phomeDiv").style.display = "block";
          }}
        }}

      </script>
  """)

    form_set_defaults_script = Unicode("""
      <script>
              function selectValueOrFirst(id, value) {{
                select = document.getElementById(id);
                select.selectedIndex = 0;

                for (i = 0; i < select.options.length; i++) {{
                  if (select.options[i].value === value) {{
                    select.selectedIndex = i;
                    return true;
                  }}
                }}
                return false;
              }}

              function selectImage(imageName) {{
                const categoryList = ["simple", "r", "tf", "matlab", "various", "folding"]

                let isImageFound = false;

                for (const category of categoryList) {{
                  const selectListId = category + "nblistselection";

                  document.getElementById(category + "nb").checked = true;
                  showImageOptions();
                  const found = selectValueOrFirst(selectListId, imageName)
                  if (found) {{
                    isImageFound = true;
                    break;
                  }}
                }}
                if (!isImageFound) {{
                  const firstCategory = categoryList[0];
                  const firstSelectListId = firstCategory + "nblistselection";
                  document.getElementById(firstCategory + "nb").checked = true;
                  showImageOptions();
                  // Select the first element in the first category's list
                  selectValueOrFirst(firstSelectListId, null);
              }}
              }}

              // Set default values
              if (["", "delete", "remain"].includes("{phome}")) {{
                document.getElementById("new").checked = true;
              }} else {{
                document.getElementById("existing").checked = true;
              }}

              getHomesFromKubernetes();
              selectValueOrFirst("homeselection", "{home}");
              selectValueOrFirst("memselection", "{mem}");
              selectValueOrFirst("migamountselection", "{migamount}");
              selectValueOrFirst("phid", ["delete", "remain"].includes("{phome}") ? "" : "{phome}");

              document.getElementById("cpuinput").value = "{cpu}" || "1";
              document.getElementById("phomecheck").checked = "{phome}" === "delete";
              document.getElementById("locationstoragemount").checked = "{mounttostorage}" === "True"
              document.getElementById("projectselection").checked = "{mountprojects}" === "True"

              s3check = document.getElementById("s3check")
              s3check.checked = "{s3url}" != "" || "{s3existing}" != "";
              showS3Options();
              document.getElementById("ss3id").value = "{s3url}" != "" ? "new" : "existing";
              showS3TypeOptions(s3check);
              if ("{s3url}" != "") {{
                document.getElementById("s3url").value = "{s3url}";
                document.getElementById("s3bucket").value = "{s3bucket}";
                document.getElementById("s3accesskey").value = "{s3accesskey}";
                document.getElementById("s3secretkey").value = "{s3secretkey}";
              }} else {{
                selectValueOrFirst("s3id", "{s3existing}");
              }}

              if ("{custom}" === "True") {{
                document.getElementById("customnb").checked = true;
                showImageOptions();
                document.getElementById("customimage").value = "{container_image}";
              }} else {{
                selectImage("{container_image}")
              }}

              selectValueOrFirst("gpuid", "{gpu}");
              customGpuCheck(document.getElementById("gpuid"));

              homeCheck = document.getElementById("homecheck")
              homeCheck.checked = "{home}" != "";
              showHomeOptions(homeCheck);
        </script>
  """, config=True)

    form_template_dev = Unicode("""
        <h3 style="background-color:orange;">Developement version of Jupyterhub</h3>
        <p style="background-color:orange;">This version is not meant for public use. If it is not intended, please continue to production version <a href="https://hub.cloud.e-infra.cz">https://hub.cloud.e-infra.cz</a>.</p>
  """)

    form_template = Unicode("""
      <h3>Choosing image</h3>

        <p>Apart from Jupyter Notebook images, you can also spawn R based images (pure R or RStudio) where GPU is not supported. If you seek another version of R with RStudio, GPU suppert or have other requirements send your inquiry to our <a href="mailto:k8s@ics.muni.cz">IT Service desk</a>. </p>

        <p>If you want to run custom image, write its name into the text field in format <i>repo/image_name:tag</i> or <i>repo/image_name</i>. Images with no tag will be treated as latest, default image is set to Minimal NB.</p>

        <div>
        <label for="imageselection">Select an image:</label><br>
        <input type="radio" id="simplenb" name="images" required="required" value="simple" onclick="showImageOptions();">
        <label for="simplenb">Simple Jupyter images</label><br>
        <input type="radio" id="rnb" name="images" value="r" onclick="showImageOptions();">
        <label for="rnb">R image</label><br>
        <input type="radio" id="tfnb" name="images" value="tf" onclick="showImageOptions();">
        <label for="tfnb">Tensorflow Jupyter images</label><br>
        <input type="radio" id="matlabnb" name="images" value="matlab" onclick="showImageOptions();">
        <label for="matlabnb">Matlab images</label><br>
        <input type="radio" id="variousnb" name="images" value="various" onclick="showImageOptions();">
        <label for="variousnb">Various images</label><br>
        <input type="radio" id="foldingnb" name="images" value="folding" onclick="showImageOptions();">
        <label for="foldingnb">Folding images</label> (Colabfold, ESMFold)<br>
        <input type="radio" id="customnb" name="images" value="custom" onclick="showImageOptions();">
        <label for="customnb">Custom image</label><br>
        </div>

        <div id="simplenblist" style="display: none;">
        <select class="form-control" id="simplenblistselection" name="simplenbname" autofocus>
            {simplenb_template}
        </select>
        </div>

        <div id="rnblist" style="display: none;">
        <select class="form-control" id="rnblistselection" name="rnbname" autofocus>
            {rnb_template}
        </select>
        </div>

        <div id="matlabnblist" style="display: none;">
        <select class="form-control" id="matlabnblistselection" name="matlabnbname" autofocus>
            {matlabnb_template}
        </select>
        </div>

        <div id="tfnblist" style="display: none;">
        <select class="form-control" id="tfnblistselection" name="tfnbname" autofocus>
            {tfnb_template}
        </select>
        </div>

        <div id="variousnblist" style="display: none;">
        <select class="form-control" id="variousnblistselection" name="varnbname" autofocus>
            {variousnb_template}
        </select>
        </div>

        <div id="foldingnblist" style="display: none;">
        <select class="form-control" id="foldingnblistselection" name="foldnbname" autofocus>
            {foldingnb_template}
        </select>
        </div>

        <div id="custom" style="display: none;">
        <label for="customimage">Custom image name:</label> <input type="text" id="customimage" name="customimage">
        </div>

        <div>
        <input type="checkbox" id="sshaccess" name="sshCheck" value="yes">
        <label for="sshaccess">Ensure ssh access into the notebook</label>Connection will be available at jovyan@{ssh_dns_domain}<br>
        </div>

        <h3>Choosing storage</h3>
        <p>The notebook will spawn with chosen persistent volume which will be mounted into <i>/home/jovyan</i>. Persistent home means that even when notebook gets deleted, the data will persist and can be used again. You can choose from mounting a <b>new</b> home for the spawned notebook or mounting an <b>existing</b> one. If you choose to mount a new home and home's name would be the same as the name of notebook being spawned, you must explicitly check the checkbox stating <i>Erase if home exists</i>. Otherwise, new home will not be created and already existing home will be mounted! </p>

         <div>
          <br>
          <label for="phomeselection">Select persistent home type:</label><br>
          <input type="radio" id="new" name="phselection" required="required" value="new" onclick="getHomesFromKubernetes();">
          <label for="new">New</label><br>
          <input type="radio" id="existing" name="phselection" value="existing" onclick="getHomesFromKubernetes();">
          <label for="existing">Existing</label><br>

            <div id="phomeDiv" style="display: none;">
            <input type="checkbox" id="phomecheck" name="phCheck" value="new">
            <label for="phomecheck">Erase if home exists</label><br>
            </div>

            <div id="pvcnames" style="display: none;">
            <label for="phid">Select persistent home:</label>
            <select class="form-control" name="phname" id="phid" autofocus>
                {option_template}
            </select>
            </div>
        </div>

        <div>
          <br>
          <label for="mhomeselection">MetaCentrum storage options:</label><br>
          <input type="checkbox" id="homecheck" name="storageCheck" value="meta" onclick="showHomeOptions();">
          <label for="homecheck">Mount MetaCentrum home</label> (mounted to <i>/home/meta/username</i>)<br>
        </div>

        <div id="customHome" style="display: none;">
            <label for="home">Select home:</label>
            <select class="form-control" id="homeselection" name="home" autofocus>
                {home_template}
            </select>
            <div>
                <input type="checkbox" id="locationstoragemount" name="locationStorageCheck" value="yes">
                <label for="locationstoragemount">Mount MetaCentrum home to <i>/storage/[chosen_storage]/home/[meta_username]</i></label> as well<br>
            </div>
        </div>

        <div>
            <input type="checkbox" id="projectselection" name="projectCheck" value="yes">
            <label for="projectselection">Mount project directories<br>
        </div>

        <div>
            <input type="checkbox" id="s3check" name="s3check" value="s3check" onclick="showS3Options();">
            <label for="s3check">Mount S3 bucket<br>

            <div id="s3select" style="display: none;"> <label for="s3selection">Select S3 type:</label> <select
            class="data-list-input" name="s3selection" required="required" style="width:190px;" id="ss3id"
            onchange="showS3TypeOptions();"> <option value="new">New bucket</option> <option value="existing">Existing
            bucket</option> </select> </div>


            <div id="s3names" style="display: none;">
                <label for="s3id">Select existing S3 bucket:</label>
                <select class="form-control" name="s3name" id="s3id" autofocus>
                    {s3option_template}
                </select>
            </div>

            <div id="s3urldiv" style="display: none;">
                <input type="text" id="s3url" name="s3url">
            </div>
            <div id="s3bucketdiv" style="display: none;">
                <input type="text" id="s3bucket" name="s3bucket">
            </div>
            <div id="s3accesskeydiv" style="display: none;">
                <input type="text" id="s3accesskey" name="s3accesskey">
            </div>
            <div id="s3secretkeydiv" style="display: none;">
                <input type="text" id="s3secretkey" name="s3secretkey">
            </div>
        </div>

        <h3>Resources</h3>
        <p>The notebook is spawned only when one node fulfills <i>all</i> your requirements (resources can not be shared among nodes). If you plan to use larger amount of resources or more GPUs, we recommend checking <a href="https://hub.cloud.e-infra.cz/availres">table of available resources</a> in the cluster. You can verify if there is a node in cluster that can accomodate your notebook or adjust your requirements for notebook to be spawed immediately.</p>
        <h4>CPU</h4>
        <p>By default, 1 CPU is assigned to notebooks.</p>
        <label for="cpuinput">Select number of CPU (1-32):</label> <input type="number" id="cpuinput" name="cpuselection" min="1" max="32" value="1">

        <h4>Memory</h4>
        <p>Please choose upper memory limit (in GB) which will be assigned to notebook.</p>
        <select class="data-list-input" id="memselection" name="memselection" required="required" style="width:190px;">
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
              <option value="64">64</option>
              <option value="128">128</option>
              <option value="256">256</option>
        </select>

        <h4>GPU</h4>
        <p>By default, no GPU is assigned. If you want to use a GPU, there are two possibile ways. You can request:</p>
        <ul style="list-style-type;">
              <li>10GB part of A100 GPU</li>
              <li>20GB part of A100 GPU</li>
              <li>whole A10 GPU</li>
              <li>whole A40 GPU</li>
              <li>whole A100 GPU</li>
              <li>any whole GPU</li>
        </ul>

        <p><i>10GBi or 20GB part of A100 GPU</i> is a part of bigger GPU which utilizes MIG capability of A100 card at the hardware level. Node is equipped with 80GB A100 card that is split into 7 10GB parts. You can request multiple parts together specifying more GPUs (up to 7). The parts are isolated, therefore you are guaranteed to truly receive specified size without other interferences.</p>

        <p><i>Whole GPU</i> offers bigger memory - 40GB. However, it is possible that all whole GPU units are already allocated and the notebook will not spawn right away. If that's the case, you can try again later or use a GPU part.</p>

        <p>We strongly advise to request a GPU part instead of whole GPU because there is a limited number of GPUs in the cluster. Furthermore, statistics show that users often do not know how to utilize GPU efficiently thus waste resources. If you request whole GPU and do not use it efficiently, you might be banned from requesting it again.</p>

        <p>SHM is now always enabled.</p>

        <label for="gpuselection">Select GPU usage type:</label>
        <select class="data-list-input" name="gpuselection" id="gpuid" required="required" style="width:190px;" onchange="customGpuCheck(this);">
              <option value="none">None</option>
              <option value="mig-1g.10gb">10GB part A100</option>
              <option value="mig-2g.20gb">20GB part A100</option>
              <option value="a10">whole A10</option>
              <option value="a40">whole A40</option>
              <option value="a100">whole A100</option>
              <option value="any">any whole gpu</option>
        </select>

        <div id="migamount" style="display: none;">
        <label for="migamount">Select amount of requested MIG parts:</label>
        <select class="data-list-input" id="migamountselection" name="migamount" style="width:190px;">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
        </select>
        </div>

        <div style="display: flex; justify-content: center;">
        <div style="display:inline-block;">
        <iframe src="https://kuba-mon.cloud.e-infra.cz/d-solo/H5q_43FVk/jupyterhub?orgId=1&theme=light&panelId=49" width="300" height="200" frameborder="0" align="left"></iframe>
        </div>
        <div style="display:inline-block;">
        <iframe src="https://kuba-mon.cloud.e-infra.cz/d-solo/H5q_43FVk/jupyterhub?orgId=1&theme=light&panelId=50" width="300" height="200" frameborder="0" align="left"></iframe>
        </div>
        </div>

        <p> For more information or error handling consult <a href="https://docs.cerit.io/docs/jupyterhub.html">documentation</a> or contact us at <i>k8s@ics.muni.cz</i>.</p>""",
                            config=True, help="Form template."
                            )

    option_template = Unicode("""
            <option value="{item}">{item}</option>""",
                              config=True, help="Template for html form options."
                              )

    image_template = Unicode("""
            <option value="cerit.io/hubs/{image}">{name}</option>""",
                             config=True, help="Template for html image form options."
                             )

    async def get_options_form(self):
        """Return the form with the drop-down menu."""
        phomes = []
        s3buckets = []
        username = self.user.name
        if "-" in username:
            username = username.replace("-", "-2d")
        if "_" in username:
            username = username.replace("_", "-5f")
        namespace = "jupyterhub-" + username + "-" + JHENV + "-ns"
        ssh_dns_domain = self.pod_name + ".dyn.cloud.e-infra.cz"
        pvcs = await self.api.list_namespaced_persistent_volume_claim(namespace=namespace, watch=False)
        await asyncio.sleep(3)
        for pvc in pvcs.items:
            if re.match(username + "-home-", pvc.metadata.name):
                print("Considering pvc: " + pvc.metadata.name + " for " + username + "-home-")
                phomes.append(pvc.metadata.name)
            if re.match("s3-", pvc.metadata.name):
                print("Considering pvc: " + pvc.metadata.name + " for s3-")
                s3buckets.append(pvc.metadata.name)
        ph_options = ''.join([
            self.option_template.format(item=p) for p in phomes
        ])
        s3_options = ''.join([
            self.option_template.format(item=b) for b in s3buckets
        ])
        mh_options = ''.join([
            self.option_template.format(item=h) for h in self.homes
        ])
        simple_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.simple.items()
        ])
        r_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.ro.items()
        ])
        tf_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.tfo.items()
        ])
        matlab_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.matlab.items()
        ])
        various_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.various.items()
        ])
        folding_options = ''.join([
            self.image_template.format(image=i, name=n) for i, n in self.folding.items()
        ])

        # USER OPTIONS FROM PREVIOUS SPAWN
        for key, value in self.user_options.items():
            if value is not None:
                print("Key is: " + str(key) + " value is: " + str(value))
            else:
                print("Key is: " + str(key) + " and value is None")

        default_values_script = self.form_set_defaults_script.format_map(
            defaultdict(lambda: "", {key: value for key, value in self.user_options.items() if value is not None}))

        return (
                self.form_template_script
                + (self.form_template_dev if JHENV == "dev" else "")
                + self.form_template.format(option_template=ph_options, home_template=mh_options, s3option_template=s3_options,
                                            simplenb_template=simple_options, rnb_template=r_options,
                                            tfnb_template=tf_options,
                                            matlabnb_template=matlab_options, variousnb_template=various_options,
                                            foldingnb_template=folding_options,
                                            ssh_dns_domain=ssh_dns_domain)
                + default_values_script
        )

    def options_from_form(self, formdata):
        """Parse the submitted form data and turn it into the correct
           structures for self.user_options."""

        options = {}
        default_home = self.homes[0]

        image = formdata.get('images')
        print(formdata)
        if image[0] == "simple":
            i = formdata.get("simplenbname")[0]  # default??
            print(i)
            options['container_image'] = i
        if image[0] == "r":
            i = formdata.get("rnbname")[0]  # default??
            options['container_image'] = i
        if image[0] == "tf":
            i = formdata.get("tfnbname")[0]  # default??
            options['container_image'] = i
        if image[0] == "matlab":
            i = formdata.get("matlabnbname")[0]  # default??
            options['container_image'] = i
        if image[0] == "various":
            i = formdata.get("varnbname")[0]  # default??
            options['container_image'] = i
        if image == "folding":
            i = formdata.get("foldnbname")[0]
            options['container_image'] = i
        if image[0] == "custom":
            i = formdata.get("customimage")[0]  # default??
            options['container_image'] = i
            options['custom'] = True

        ssh_access = formdata.get('sshCheck')
        if ssh_access:
            options['ssh'] = True
        else:
            options['ssh'] = False

        phtype = formdata.get('phselection')[0]
        if phtype == "new":
            if formdata.get('phCheck'):
                options['phome'] = "delete"
            else:
                options['phome'] = "remain"
        else:
            if not formdata.get('phname'):
                raise web.HTTPError(422, "No existing PVC was found, please choose option 'New'!")
            else:
                options['phome'] = formdata.get('phname')[0]

        mount_projects = formdata.get('projectCheck')
        if mount_projects:
            options['mountprojects'] = True
        else:
            options['mountprojects'] = False

        storage = formdata.get('storageCheck')
        if storage:
            home = formdata.get('home', [default_home])[0]
            options['home'] = home
            mount_to_storage_loc = formdata.get('locationStorageCheck')
            if mount_to_storage_loc:
                options['mounttostorage'] = True
            else:
                options['mounttostorage'] = False
        else:
            options['home'] = None

        if formdata.get("s3check"):
            s3type = formdata.get('s3selection')[0]
            if s3type == "new":
                options["s3url"] = formdata.get("s3url")[0]
                options["s3bucket"] = formdata.get("s3bucket")[0]
                options["s3accesskey"] = formdata.get("s3accesskey")[0]
                options["s3secretkey"] = formdata.get("s3secretkey")[0]
            else:
                if not formdata.get('s3name'):
                    raise web.HTTPError(422, "No existing S3 bucket was found, please choose option 'New'!")
                else:
                    options['s3existing'] = formdata.get('s3name')[0]

        options['cpu'] = formdata.get('cpuselection')[0]
        options['mem'] = formdata.get('memselection')[0]
        options['gpu'] = formdata.get('gpuselection')[0]
        if options['gpu'].startswith("mig"):
            options['migamount'] = formdata.get('migamount')[0]
        options['shmsize'] = options['mem']

        print(options)
        return options

    def _build_pod_labels(self, extra_labels):
        labels = self._build_common_labels(extra_labels)
        labels.update(
            {
                'component': self.component_label,
                'hub.jupyter.org/servername': escapism.escape(
                    self.name.lower(), safe=self.safe_chars, escape_char='-'
                ).lstrip("-"),
            }
        )
        return labels