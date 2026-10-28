"""Read the deployed public sitemap and verify HTTP/XML content after Pages deploy."""
import sys,time
from urllib.request import Request,urlopen
from xml.etree import ElementTree as ET
base=sys.argv[1].rstrip('/')+'/'
url=base+'sitemap.xml'
for attempt in range(6):
 try:
  request=Request(url,headers={'User-Agent':'RootRice-Public-Sitemap-Check','Cache-Control':'no-cache'})
  with urlopen(request,timeout=20)as response:
   body=response.read(1024*1024);status=response.status;final=response.url;content_type=response.headers.get('Content-Type','')
  root=ET.fromstring(body)
  if root.tag!='{http://www.sitemaps.org/schemas/sitemap/0.9}urlset':raise ValueError('The public response is not a sitemap urlset')
  locations=[el.text for el in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
  if base not in locations:raise ValueError('The public sitemap does not contain the deployed homepage')
  print('PUBLIC_SITEMAP_OK HTTP',status,'Content-Type:',content_type,'URL:',final,'Homepage:',base,'URLs:',len(locations),flush=True)
  break
 except Exception as error:
  print('Public sitemap check',attempt+1,'failed:',str(error),flush=True)
  if attempt==5:raise
  time.sleep(10)
