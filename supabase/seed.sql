-- ============================================================
-- SAFE ROUTE AI — seed data  (Pilot city: Delhi NCR)
--
-- ALL ROWS BELOW ARE LABELLED  "DEMO / SIMULATED SAFETY DATA".
-- They are geographically clustered around Delhi, Noida,
-- Ghaziabad and Gurugram. Safe to run repeatedly (idempotent-ish:
-- clears demo rows first).
-- ============================================================

-- Clean previous demo data so re-seeding stays deterministic.
delete from public.alerts          where title like 'DEMO%';
delete from public.route_options   where route_id in (select id from public.routes where origin_address like 'DEMO%');
delete from public.routes          where origin_address like 'DEMO%';
delete from public.community_reports where is_demo = true;
delete from public.news_articles     where is_demo = true;
delete from public.incidents         where is_demo = true;

-- ---------- 32 incidents ----------
insert into public.incidents
  (type, severity, title, description, latitude, longitude, address,
   occurred_at, source, source_url, verified, verification_status, confidence, is_demo)
values
-- Delhi core
('robbery','high','Chain snatching near Connaught Place','Two-wheeler snatching reported outside Metro gate.',28.6315,77.2167,'Connaught Place, New Delhi', now()-interval '2 days','DEMO / SIMULATED SAFETY DATA','https://example.com/demo/1',true,'verified',0.86,true),
('harassment','medium','Street harassment reported','Group loitering, verbal harassment after dark.',28.6280,77.2100,'Janpath, New Delhi', now()-interval '5 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.72,true),
('theft','low','Pickpocketing at market','Wallet theft in crowded market lane.',28.6562,77.2410,'Chandni Chowk, Delhi', now()-interval '9 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.6,true),
('assault','critical','Assault outside nightclub','Physical altercation, one injured.',28.5245,77.1855,'Hauz Khas Village, Delhi', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.9,true),
('vehicle_theft','high','Car break-in','Window smashed, valuables stolen from parked car.',28.5672,77.2100,'Saket, Delhi', now()-interval '4 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.8,true),
('accident','medium','Multi-vehicle collision','Minor injuries, road partially blocked.',28.5921,77.2290,'Ring Road, Lajpat Nagar', now()-interval '3 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.7,true),
('protest','medium','Planned demonstration','Large gathering, traffic diversions expected.',28.6270,77.2410,'ITO, Delhi', now()-interval '6 hours','DEMO / SIMULATED SAFETY DATA',null,false,'pending',0.5,true),
('snatching','high','Phone snatching','Mobile snatched from pedestrian at signal.',28.6450,77.2160,'Kashmere Gate, Delhi', now()-interval '7 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.82,true),
('burglary','medium','Residential break-in','Attempted burglary reported by residents.',28.6000,77.1900,'Rajinder Nagar, Delhi', now()-interval '11 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.65,true),
('road_closure','low','Road closure for repairs','Lane closed for water pipeline work.',28.6100,77.2300,'Pragati Maidan, Delhi', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.55,true),
-- Noida
('robbery','critical','Armed robbery at ATM','Two suspects, cash taken; police alerted.',28.5700,77.3260,'Sector 18, Noida', now()-interval '2 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.92,true),
('harassment','high','Harassment near metro','Reported stalking incident after office hours.',28.5800,77.3120,'Botanical Garden, Noida', now()-interval '3 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.78,true),
('vehicle_theft','high','Two-wheeler stolen','Bike stolen from apartment parking.',28.5920,77.3600,'Sector 62, Noida', now()-interval '8 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.8,true),
('theft','low','Shoplifting','Minor theft from retail store.',28.5670,77.3350,'DLF Mall, Noida', now()-interval '12 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.5,true),
('accident','high','Highway pile-up','Fog-related collision on expressway.',28.5100,77.4100,'Noida-Greater Noida Expressway', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.85,true),
('snatching','medium','Bag snatching','Handbag snatched by two on a motorcycle.',28.5760,77.3550,'Sector 15, Noida', now()-interval '6 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.7,true),
('assault','high','Group assault','Fight between groups near market.',28.5850,77.3300,'Atta Market, Noida', now()-interval '4 days','DEMO / SIMULATED SAFETY DATA',null,false,'pending',0.6,true),
-- Ghaziabad
('robbery','high','Mobile shop robbery','Snatch-and-run at electronics shop.',28.6700,77.4400,'Raj Nagar, Ghaziabad', now()-interval '3 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.83,true),
('harassment','medium','Eve-teasing reported','Reported near bus stop in evening.',28.6650,77.4600,'Vaishali, Ghaziabad', now()-interval '5 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.68,true),
('accident','medium','Bike-car collision','Rider injured at intersection.',28.6800,77.4300,'Mohan Nagar, Ghaziabad', now()-interval '2 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.72,true),
('vehicle_theft','medium','Scooter theft','Scooter stolen from railway parking.',28.6600,77.4200,'Ghaziabad Railway Station', now()-interval '10 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.6,true),
('theft','low','Chain theft attempt','Failed snatching attempt reported.',28.6720,77.4500,'Indirapuram, Ghaziabad', now()-interval '7 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.5,true),
('protest','low','Local protest','Small protest over civic issues.',28.6690,77.4530,'Kavi Nagar, Ghaziabad', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,false,'pending',0.4,true),
-- Gurugram
('robbery','critical','House robbery','Break-in with valuables stolen overnight.',28.4600,77.0800,'DLF Phase 3, Gurugram', now()-interval '2 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.9,true),
('harassment','high','Cab harassment complaint','Passenger reported unsafe behaviour.',28.4500,77.0400,'Cyber City, Gurugram', now()-interval '3 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.77,true),
('vehicle_theft','high','SUV stolen','Vehicle stolen from society parking.',28.4200,77.0600,'Sohna Road, Gurugram', now()-interval '6 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.81,true),
('accident','critical','Fatal expressway accident','High-speed crash; expressway lane closed.',28.4100,77.0300,'Delhi-Gurugram Expressway', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.93,true),
('snatching','medium','Phone snatched','Two-wheeler snatchers near market.',28.4700,77.0500,'Sector 29, Gurugram', now()-interval '5 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.7,true),
('theft','low','Bag theft in food court','Unattended bag stolen at mall.',28.4630,77.0720,'MG Road, Gurugram', now()-interval '9 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.5,true),
('assault','high','Road rage assault','Altercation escalated to violence.',28.4400,77.0450,'IFFCO Chowk, Gurugram', now()-interval '4 days','DEMO / SIMULATED SAFETY DATA',null,false,'pending',0.62,true),
('road_closure','medium','Underpass closed','Waterlogging closed the underpass.',28.4550,77.0500,'Rajiv Chowk, Gurugram', now()-interval '1 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.55,true),
('burglary','high','Shop burglary','Shutters broken; cash box stolen.',28.4650,77.0680,'Sadar Bazaar, Gurugram', now()-interval '8 days','DEMO / SIMULATED SAFETY DATA',null,true,'verified',0.8,true);

-- ---------- 10 community reports (user_id NULL = demo submissions) ----------
insert into public.community_reports
  (user_id, incident_type, description, severity, latitude, longitude, address, status, confidence, is_demo)
values
(null,'harassment','Felt unsafe walking here at night, poor lighting.','medium',28.6290,77.2110,'Barakhamba Road, Delhi','pending',0.55,true),
(null,'theft','Saw someone attempt to pick a pocket.','low',28.6560,77.2400,'Chandni Chowk, Delhi','verified',0.6,true),
(null,'snatching','Phone snatching happened right in front of me.','high',28.5760,77.3550,'Sector 15, Noida','verified',0.75,true),
(null,'road_closure','Road blocked, no signage.','low',28.6100,77.2300,'Pragati Maidan, Delhi','verified',0.5,true),
(null,'assault','Heard a fight break out near the market.','high',28.5850,77.3300,'Atta Market, Noida','pending',0.5,true),
(null,'harassment','Group of men catcalling at bus stop.','medium',28.6650,77.4600,'Vaishali, Ghaziabad','pending',0.52,true),
(null,'vehicle_theft','My scooter was stolen from here last week.','medium',28.6600,77.4200,'Ghaziabad Station','verified',0.65,true),
(null,'robbery','Suspicious activity near ATM late night.','high',28.5700,77.3260,'Sector 18, Noida','pending',0.58,true),
(null,'accident','Bad accident spot, happens often.','medium',28.6800,77.4300,'Mohan Nagar, Ghaziabad','verified',0.6,true),
(null,'harassment','Cab driver behaved inappropriately.','high',28.4500,77.0400,'Cyber City, Gurugram','rejected',0.3,true);

-- ---------- 10 news articles (DEMO NEWS DATA) ----------
insert into public.news_articles
  (title, description, url, source, published_at, content, processed, is_demo, ai_analysis)
values
('Police bust snatching gang in South Delhi','Three arrested in connection with chain snatchings.','https://demo.news/1','DEMO NEWS DATA', now()-interval '1 days','Delhi Police arrested three suspects...',true,true,
  '{"incidentType":"snatching","location":"South Delhi","severity":"high","confidence":0.8,"riskKeywords":["snatching","arrest"]}'::jsonb),
('Robbery reported at Noida ATM','Cash looted from an ATM in Sector 18.','https://demo.news/2','DEMO NEWS DATA', now()-interval '2 days','An armed robbery took place...',true,true,
  '{"incidentType":"robbery","location":"Sector 18, Noida","severity":"critical","confidence":0.85,"riskKeywords":["robbery","armed"]}'::jsonb),
('Traffic diversions for planned protest at ITO','Commuters advised to avoid the area.','https://demo.news/3','DEMO NEWS DATA', now()-interval '6 hours','A demonstration is planned...',false,true,null),
('Fog causes highway pile-up on expressway','Several vehicles damaged in low visibility.','https://demo.news/4','DEMO NEWS DATA', now()-interval '1 days','Dense fog led to a collision...',true,true,
  '{"incidentType":"accident","location":"Noida-Greater Noida Expressway","severity":"high","confidence":0.78,"riskKeywords":["accident","fog"]}'::jsonb),
('Harassment complaints rise near metro stations','Authorities increase patrolling.','https://demo.news/5','DEMO NEWS DATA', now()-interval '3 days','Reports of harassment...',false,true,null),
('House robbery in DLF Phase 3','Valuables stolen overnight; investigation on.','https://demo.news/6','DEMO NEWS DATA', now()-interval '2 days','A break-in was reported...',true,true,
  '{"incidentType":"robbery","location":"DLF Phase 3, Gurugram","severity":"critical","confidence":0.82,"riskKeywords":["robbery","burglary"]}'::jsonb),
('Road rage incident at IFFCO Chowk','Altercation between two drivers turns violent.','https://demo.news/7','DEMO NEWS DATA', now()-interval '4 days','A road rage incident...',false,true,null),
('Vehicle thefts spike in Ghaziabad','Police issue advisory for residents.','https://demo.news/8','DEMO NEWS DATA', now()-interval '5 days','A rise in two-wheeler thefts...',true,true,
  '{"incidentType":"vehicle_theft","location":"Ghaziabad","severity":"medium","confidence":0.7,"riskKeywords":["theft","vehicle"]}'::jsonb),
('Underpass waterlogging closes Gurugram route','Commuters face delays after heavy rain.','https://demo.news/9','DEMO NEWS DATA', now()-interval '1 days','Waterlogging closed the underpass...',false,true,null),
('Assault outside Hauz Khas nightclub','One injured; police register case.','https://demo.news/10','DEMO NEWS DATA', now()-interval '1 days','An assault was reported...',true,true,
  '{"incidentType":"assault","location":"Hauz Khas, Delhi","severity":"critical","confidence":0.88,"riskKeywords":["assault","violence"]}'::jsonb);

-- ---------- 5 demo alerts (linked to real seeded incidents) ----------
insert into public.alerts (user_id, incident_id, title, message, severity, latitude, longitude, distance_from_user)
select null, i.id,
       'DEMO alert: ' || i.title,
       i.severity || '-severity ' || i.type || ' reported near your route.',
       i.severity, i.latitude, i.longitude,
       (200 + (row_number() over (order by i.occurred_at desc)) * 150)::double precision
from public.incidents i
where i.is_demo = true and i.severity in ('high','critical')
order by i.occurred_at desc
limit 5;

-- ---------- example routes with scored options ----------
-- Route 1: Connaught Place -> Noida Sector 18 (two alternatives, different safety)
with r as (
  insert into public.routes (origin_lat, origin_lng, destination_lat, destination_lng,
                             origin_address, destination_address, selected_route_index)
  values (28.6315,77.2167, 28.5700,77.3260,
          'DEMO: Connaught Place, Delhi','DEMO: Sector 18, Noida', 1)
  returning id
)
insert into public.route_options
  (route_id, route_index, distance_meters, duration_seconds, safety_score, risk_level, geometry, risk_reasons)
select r.id, v.idx, v.dist, v.dur, v.score, v.risk, v.geom::jsonb, v.reasons::jsonb
from r, (values
  (0, 21500.0, 2400.0, 58.0, 'ELEVATED',
   '{"type":"LineString","coordinates":[[77.2167,28.6315],[77.27,28.60],[77.3260,28.5700]]}',
   '["Passes near 2 high-severity incidents","Recent robbery within 300m"]'),
  (1, 23200.0, 2580.0, 81.0, 'LOW',
   '{"type":"LineString","coordinates":[[77.2167,28.6315],[77.25,28.62],[77.3260,28.5700]]}',
   '["Only 3 min slower","Avoids recent robbery cluster","No critical incidents within 500m"]')
) as v(idx,dist,dur,score,risk,geom,reasons);

-- Route 2: Cyber City -> IFFCO Chowk (single option, elevated risk)
with r as (
  insert into public.routes (origin_lat, origin_lng, destination_lat, destination_lng,
                             origin_address, destination_address, selected_route_index)
  values (28.4500,77.0400, 28.4400,77.0450,
          'DEMO: Cyber City, Gurugram','DEMO: IFFCO Chowk, Gurugram', 0)
  returning id
)
insert into public.route_options
  (route_id, route_index, distance_meters, duration_seconds, safety_score, risk_level, geometry, risk_reasons)
select r.id, 0, 2100.0, 420.0, 47.0, 'ELEVATED',
  '{"type":"LineString","coordinates":[[77.0400,28.4500],[77.0450,28.4400]]}'::jsonb,
  '["Road rage assault reported nearby","Evening time-of-day risk"]'::jsonb
from r;

-- ---------- AI agent log samples (so the AI ops dashboard has data on first load) ----------
insert into public.ai_agent_logs (agent_name, operation, input, output, status, execution_time_ms)
values
('newsAnalysisAgent','analyze_article','{"title":"Robbery reported at Noida ATM"}'::jsonb,'{"incidentType":"robbery","severity":"critical"}'::jsonb,'success',342),
('riskScoringAgent','score_route','{"points":42}'::jsonb,'{"score":81,"riskLevel":"LOW"}'::jsonb,'success',81),
('verificationAgent','verify_report','{"reportId":"demo"}'::jsonb,'{"status":"verified","confidence":0.75}'::jsonb,'success',120),
('routePlanningAgent','recommend','{"routes":2}'::jsonb,'{"recommendedRoute":1}'::jsonb,'success',210),
('orchestratorAgent','plan_route','{"origin":"CP","destination":"Sector 18"}'::jsonb,'{"routeId":"demo","recommended":1}'::jsonb,'success',742);
