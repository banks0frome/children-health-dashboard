-- Seed data: 20 submissions, 5 staff members
-- Dates relative to March 21, 2026

-- ===== STAFF MEMBERS =====

INSERT INTO staff_members (id, name, role, email, availability, expertise, service_area) VALUES
('staff-001', 'Maria Gutierrez', 'Community Health Educator', 'maria.g@childrenshealth.org',
 '{"weekdays": true, "weekends": false}',
 '["car_seats","helmet_safety","water_safety"]',
 '["Salt Lake","Davis"]'),
('staff-002', 'James Chen', 'Senior Health Specialist', 'james.c@childrenshealth.org',
 '{"weekdays": true, "weekends": true}',
 '["poison_prevention","safe_sleep","medication_safety"]',
 '["Utah","Wasatch","Summit"]'),
('staff-003', 'Priya Patel', 'Outreach Coordinator', 'priya.p@childrenshealth.org',
 '{"weekdays": true, "weekends": false}',
 '["water_safety","bike_safety","pedestrian_safety"]',
 '["Salt Lake","Tooele"]'),
('staff-004', 'David Morales', 'Program Manager', 'david.m@childrenshealth.org',
 '{"weekdays": true, "weekends": true}',
 '["car_seats","safe_sleep","fire_safety"]',
 '["Weber","Davis","Box Elder"]'),
('staff-005', 'Sarah Kim', 'Health Education Intern', 'sarah.k@childrenshealth.org',
 '{"weekdays": true, "weekends": false}',
 '["helmet_safety","bike_safety","water_safety"]',
 '["Salt Lake"]');

-- ===== SUBMISSIONS =====

-- 1. Auto-approved event (recent)
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_at, created_at, updated_at)
VALUES ('sub-001', 'approved', 'form', 'event', 'Jennifer', 'Martinez', 'Westside Elementary PTA', 'jmartinez@westside.edu', '801-555-0101',
'{"type_confidence":0.95,"priority_score":8,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"auto_approve","confidence_pct":96,"reasoning":"Standard school event, all fields complete, within service area, adequate lead time."}',
1, '2026-03-18T10:30:00Z', '2026-03-18T09:15:00Z', '2026-03-18T10:30:00Z');

-- 2. Auto-approved mailing
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_at, created_at, updated_at)
VALUES ('sub-002', 'approved', 'form', 'mailing', 'Robert', 'Thompson', 'Davis County Library', 'rthompson@daviscounty.gov', '801-555-0102',
'{"type_confidence":0.98,"priority_score":6,"risk_flags":[],"fulfillment_recommendation":"mail","approval_recommendation":"auto_approve","confidence_pct":98,"reasoning":"Simple material mailing request, standard quantities, known organization."}',
1, '2026-03-17T14:00:00Z', '2026-03-17T13:45:00Z', '2026-03-17T14:00:00Z');

-- 3. Auto-approved event
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_at, created_at, updated_at)
VALUES ('sub-003', 'approved', 'chat', 'event', 'Lisa', 'Wong', 'Murray Community Center', 'lwong@murray.utah.gov', '801-555-0103',
'{"type_confidence":0.92,"priority_score":7,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"auto_approve","confidence_pct":91,"reasoning":"Community center event with good lead time and within primary service area."}',
1, '2026-03-15T11:00:00Z', '2026-03-15T10:20:00Z', '2026-03-15T11:00:00Z');

-- 4. Auto-approved both
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_at, created_at, updated_at)
VALUES ('sub-004', 'fulfilled', 'form', 'both', 'Amanda', 'Richardson', 'Draper Family Clinic', 'arichardson@draperclinic.com', '801-555-0104',
'{"type_confidence":0.90,"priority_score":9,"risk_flags":[],"fulfillment_recommendation":"both","approval_recommendation":"auto_approve","confidence_pct":93,"reasoning":"Healthcare partner requesting event and materials, strong history."}',
1, '2026-03-10T09:00:00Z', '2026-03-10T08:30:00Z', '2026-03-14T16:00:00Z');

-- 5. Pending review - submitted today
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-005', 'submitted', 'upload', 'event', 'Carlos', 'Rivera', 'Granite School District', 'crivera@granite.k12.ut.us', '801-555-0105',
'{"type_confidence":0.78,"priority_score":7,"risk_flags":["Large attendance: 300+","Multiple topics requested"],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":72,"reasoning":"Large school district event, high attendance may require additional staff. Multiple safety topics requested."}',
'2026-03-21T08:00:00Z', '2026-03-21T08:00:00Z');

-- 6. Pending review - submitted yesterday
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-006', 'submitted', 'paste', 'both', 'Michelle', 'Nguyen', 'Head Start Utah Valley', 'mnguyen@headstart-uv.org', '801-555-0106',
'{"type_confidence":0.85,"priority_score":8,"risk_flags":["Event is in 5 days"],"fulfillment_recommendation":"both","approval_recommendation":"manual_review","confidence_pct":79,"reasoning":"Tight timeline but within known Head Start program. Both materials and staff needed."}',
'2026-03-20T15:30:00Z', '2026-03-20T15:30:00Z');

-- 7. Pending review
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-007', 'submitted', 'form', 'mailing', 'Kevin', 'Park', 'Orem Public Library', 'kpark@orem.org', '801-555-0107',
'{"type_confidence":0.99,"priority_score":5,"risk_flags":["Large quantity: 500 helmet cards"],"fulfillment_recommendation":"mail","approval_recommendation":"manual_review","confidence_pct":68,"reasoning":"High quantity request for helmet safety cards. May exceed standard inventory allocation."}',
'2026-03-20T11:00:00Z', '2026-03-20T11:00:00Z');

-- 8. Pending review
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-008', 'submitted', 'form', 'event', 'Stephanie', 'Brooks', 'Highland Youth Soccer', 'sbrooks@hysl.org', '801-555-0108',
'{"type_confidence":0.88,"priority_score":6,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":82,"reasoning":"Youth sports organization, standard event request. Weekend event requires availability check."}',
'2026-03-19T16:00:00Z', '2026-03-19T16:00:00Z');

-- 9. In review
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-009', 'in_review', 'form', 'event', 'Daniel', 'Olsen', 'Taylorsville Rec Center', 'dolsen@tville.org', '801-555-0109',
'{"type_confidence":0.91,"priority_score":7,"risk_flags":["Outside primary service area"],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":75,"reasoning":"Recreation center event, slightly outside primary service area. Good community impact potential."}',
'2026-03-18T14:00:00Z', '2026-03-18T14:00:00Z');

-- 10. In review
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-010', 'in_review', 'upload', 'both', 'Rachel', 'Kim', 'Asian Association of Utah', 'rkim@aau.org', '801-555-0110',
'{"type_confidence":0.86,"priority_score":9,"risk_flags":["Translation services may be needed"],"fulfillment_recommendation":"both","approval_recommendation":"manual_review","confidence_pct":70,"reasoning":"Cultural organization event serving diverse community. High impact but may require translated materials."}',
'2026-03-17T09:00:00Z', '2026-03-17T09:00:00Z');

-- 11. In review
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-011', 'in_review', 'chat', 'event', 'Tyler', 'Jensen', 'Eagle Mountain City', 'tjensen@eaglemountain.gov', '801-555-0111',
'{"type_confidence":0.94,"priority_score":8,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":80,"reasoning":"City-sponsored community safety fair. Large venue, multiple topics. Good alignment with mission."}',
'2026-03-16T10:30:00Z', '2026-03-16T10:30:00Z');

-- 12. Approved (manually)
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_by, approved_at, created_at, updated_at)
VALUES ('sub-012', 'approved', 'form', 'event', 'Nancy', 'Taylor', 'Jordan School District', 'ntaylor@jordan.k12.ut.us', '801-555-0112',
'{"type_confidence":0.93,"priority_score":9,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":81,"reasoning":"Large school district event with history of successful partnerships."}',
0, 'Maria Gutierrez', '2026-03-19T11:00:00Z', '2026-03-14T08:00:00Z', '2026-03-19T11:00:00Z');

-- 13. Approved
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_by, approved_at, created_at, updated_at)
VALUES ('sub-013', 'approved', 'form', 'mailing', 'Brian', 'Anderson', 'Weber County Health Dept', 'banderson@webercounty.gov', '801-555-0113',
'{"type_confidence":0.97,"priority_score":7,"risk_flags":[],"fulfillment_recommendation":"mail","approval_recommendation":"auto_approve","confidence_pct":95,"reasoning":"Government health department, standard mailing request."}',
0, 'David Morales', '2026-03-16T14:00:00Z', '2026-03-15T09:30:00Z', '2026-03-16T14:00:00Z');

-- 14. Fulfilled
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_by, approved_at, created_at, updated_at)
VALUES ('sub-014', 'fulfilled', 'form', 'event', 'Emily', 'Davis', 'Copperview Elementary', 'edavis@canyons.edu', '801-555-0114',
'{"type_confidence":0.96,"priority_score":8,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"auto_approve","confidence_pct":94,"reasoning":"Elementary school safety presentation, standard scope."}',
1, NULL, '2026-03-08T10:00:00Z', '2026-03-05T13:00:00Z', '2026-03-13T15:00:00Z');

-- 15. Fulfilled
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_at, created_at, updated_at)
VALUES ('sub-015', 'fulfilled', 'form', 'both', 'Mark', 'Hansen', 'Sandy City Parks & Rec', 'mhansen@sandy.utah.gov', '801-555-0115',
'{"type_confidence":0.89,"priority_score":7,"risk_flags":[],"fulfillment_recommendation":"both","approval_recommendation":"auto_approve","confidence_pct":90,"reasoning":"Municipal parks department, regular partner."}',
1, '2026-03-04T09:00:00Z', '2026-03-01T10:00:00Z', '2026-03-12T14:00:00Z');

-- 16. Denied
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, denial_reason, created_at, updated_at)
VALUES ('sub-016', 'denied', 'form', 'event', 'Jason', 'Miller', 'Private Event Planning LLC', 'jmiller@privateevent.com', '801-555-0116',
'{"type_confidence":0.65,"priority_score":3,"risk_flags":["Commercial entity","No community health focus","Private event"],"fulfillment_recommendation":"mail","approval_recommendation":"manual_review","confidence_pct":35,"reasoning":"Commercial event planning company. Event appears to be a private corporate function without community health education focus."}',
'Request does not align with community health education mission. The event is a private corporate gathering without public health education components.',
'2026-03-12T11:00:00Z', '2026-03-13T09:00:00Z');

-- 17. Denied
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, denial_reason, created_at, updated_at)
VALUES ('sub-017', 'denied', 'paste', 'mailing', 'Ashley', 'Wright', '', 'awright@gmail.com', '801-555-0117',
'{"type_confidence":0.70,"priority_score":2,"risk_flags":["No organization","Out of state address","Unusually high quantity"],"fulfillment_recommendation":"mail","approval_recommendation":"manual_review","confidence_pct":28,"reasoning":"Individual request with no organizational affiliation. Shipping address is out of state (Nevada). Very high quantity requested (1000 items)."}',
'Request is for out-of-state delivery with no organizational affiliation. Our materials are funded for Utah communities.',
'2026-03-10T16:00:00Z', '2026-03-11T10:00:00Z');

-- 18. Submitted (newest)
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-018', 'submitted', 'form', 'event', 'Angela', 'Vasquez', 'Cottonwood Heights Swim Club', 'avasquez@chswim.org', '801-555-0118',
'{"type_confidence":0.93,"priority_score":8,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"manual_review","confidence_pct":84,"reasoning":"Summer swim club water safety event. Excellent alignment with mission but needs staff availability confirmation."}',
'2026-03-21T07:30:00Z', '2026-03-21T07:30:00Z');

-- 19. Approved event upcoming
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, ai_approved, approved_by, approved_at, created_at, updated_at)
VALUES ('sub-019', 'approved', 'form', 'event', 'Patricia', 'Lee', 'Riverton YMCA', 'plee@ymcautah.org', '801-555-0119',
'{"type_confidence":0.95,"priority_score":9,"risk_flags":[],"fulfillment_recommendation":"staff","approval_recommendation":"auto_approve","confidence_pct":97,"reasoning":"YMCA partner organization, standard kids safety event."}',
0, 'James Chen', '2026-03-17T10:00:00Z', '2026-03-14T14:00:00Z', '2026-03-17T10:00:00Z');

-- 20. Submitted via chat
INSERT INTO submissions (id, status, submission_method, request_type, first_name, last_name, organization, email, phone, ai_classification, created_at, updated_at)
VALUES ('sub-020', 'submitted', 'chat', 'mailing', 'Trevor', 'Blackwood', 'Lehi Fire Department', 'tblackwood@lehifd.gov', '801-555-0120',
'{"type_confidence":0.96,"priority_score":7,"risk_flags":[],"fulfillment_recommendation":"mail","approval_recommendation":"manual_review","confidence_pct":88,"reasoning":"Fire department requesting fire safety and safe sleep materials. Good community partner but first-time request."}',
'2026-03-20T09:00:00Z', '2026-03-20T09:00:00Z');


-- ===== EVENT DETAILS =====

INSERT INTO event_details (id, submission_id, event_name, event_date, start_time, end_time, estimated_attendance, audience_type, topics, is_virtual, requester_attending) VALUES
('evt-001', 'sub-001', 'Spring Safety Fair', '2026-03-28', '10:00', '14:00', 150, '["parents","children"]', '["car_seats","helmet_safety"]', 0, 1),
('evt-003', 'sub-003', 'Family Wellness Night', '2026-03-25', '18:00', '20:00', 80, '["parents","caregivers"]', '["water_safety","poison_prevention"]', 0, 1),
('evt-004', 'sub-004', 'Safe Baby Workshop', '2026-03-12', '09:00', '11:00', 30, '["new_parents"]', '["safe_sleep","medication_safety"]', 0, 0),
('evt-005', 'sub-005', 'District Safety Day', '2026-04-02', '08:00', '15:00', 350, '["students","teachers","parents"]', '["car_seats","bike_safety","pedestrian_safety"]', 0, 1),
('evt-006', 'sub-006', 'Head Start Safety Workshop', '2026-03-26', '09:30', '11:30', 45, '["parents","staff"]', '["safe_sleep","poison_prevention","car_seats"]', 0, 1),
('evt-008', 'sub-008', 'Soccer Safety Kickoff', '2026-04-05', '09:00', '12:00', 120, '["parents","children","coaches"]', '["helmet_safety","first_aid"]', 0, 1),
('evt-009', 'sub-009', 'Community Health Fair', '2026-04-10', '10:00', '16:00', 200, '["families","seniors"]', '["fire_safety","poison_prevention","medication_safety"]', 0, 0),
('evt-010', 'sub-010', 'Multicultural Safety Night', '2026-04-08', '17:00', '20:00', 100, '["families","community_leaders"]', '["car_seats","water_safety","safe_sleep"]', 0, 1),
('evt-011', 'sub-011', 'Eagle Mountain Safety Fair', '2026-04-15', '09:00', '14:00', 250, '["families"]', '["car_seats","bike_safety","water_safety","fire_safety"]', 0, 0),
('evt-012', 'sub-012', 'Spring Safety Assembly', '2026-03-27', '10:00', '11:30', 180, '["students","teachers"]', '["pedestrian_safety","bike_safety"]', 0, 1),
('evt-014', 'sub-014', 'Kindergarten Safety Day', '2026-03-11', '09:00', '11:00', 60, '["children","parents"]', '["helmet_safety","pedestrian_safety"]', 0, 1),
('evt-015', 'sub-015', 'Parks & Rec Safety Expo', '2026-03-08', '10:00', '15:00', 200, '["families"]', '["water_safety","bike_safety","sun_safety"]', 0, 0),
('evt-016', 'sub-016', 'Corporate Wellness Day', '2026-03-20', '12:00', '13:00', 50, '["employees"]', '["first_aid"]', 0, 0),
('evt-018', 'sub-018', 'Summer Swim Safety Kickoff', '2026-04-12', '10:00', '13:00', 100, '["parents","children"]', '["water_safety","sun_safety"]', 0, 1),
('evt-019', 'sub-019', 'Kids Safety Saturday', '2026-03-22', '10:00', '12:00', 75, '["children","parents"]', '["helmet_safety","bike_safety","pedestrian_safety"]', 0, 1);


-- ===== LOCATIONS =====

INSERT INTO location (id, submission_id, address_line1, city, state, zip, county, indoor_outdoor, parking_instructions) VALUES
('loc-001', 'sub-001', '4500 S Redwood Rd', 'Taylorsville', 'UT', '84123', 'Salt Lake', 'indoor', 'Main lot, enter from south entrance'),
('loc-003', 'sub-003', '5025 State St', 'Murray', 'UT', '84107', 'Salt Lake', 'indoor', 'Free parking in rear lot'),
('loc-004', 'sub-004', '12450 Fort St', 'Draper', 'UT', '84020', 'Salt Lake', 'indoor', 'Patient parking in structure'),
('loc-005', 'sub-005', '2500 S State St', 'Salt Lake City', 'UT', '84115', 'Salt Lake', 'both', 'Staff parking lot available, overflow at church next door'),
('loc-006', 'sub-006', '680 N 1200 W', 'Orem', 'UT', '84057', 'Utah', 'indoor', 'Front entrance parking'),
('loc-008', 'sub-008', '5800 W 10400 N', 'Highland', 'UT', '84003', 'Utah', 'outdoor', 'Park in gravel lot by fields'),
('loc-009', 'sub-009', '4671 S 2700 W', 'Taylorsville', 'UT', '84129', 'Salt Lake', 'indoor', 'Main entrance parking'),
('loc-010', 'sub-010', '155 S 300 W', 'Salt Lake City', 'UT', '84101', 'Salt Lake', 'indoor', 'Street parking and TRAX accessible'),
('loc-011', 'sub-011', '1650 Stagecoach Run', 'Eagle Mountain', 'UT', '84005', 'Utah', 'both', 'City park, free parking'),
('loc-012', 'sub-012', '9361 S 300 E', 'Sandy', 'UT', '84070', 'Salt Lake', 'indoor', 'Visitor lot at main office'),
('loc-014', 'sub-014', '8441 S 4015 W', 'West Jordan', 'UT', '84088', 'Salt Lake', 'indoor', 'School parking lot'),
('loc-015', 'sub-015', '440 E 8680 S', 'Sandy', 'UT', '84070', 'Salt Lake', 'both', 'Park north lot'),
('loc-018', 'sub-018', '7500 S 2700 E', 'Cottonwood Heights', 'UT', '84121', 'Salt Lake', 'outdoor', 'Pool parking lot'),
('loc-019', 'sub-019', '12930 S Redwood Rd', 'Riverton', 'UT', '84065', 'Salt Lake', 'indoor', 'YMCA main parking lot');


-- ===== MATERIALS REQUESTED =====

INSERT INTO materials_requested (id, submission_id, material_key, material_name, quantity, category, has_digital) VALUES
('mat-001a', 'sub-001', 'car_seat_cards', 'Car Seat Safety Cards', 100, 'vehicle_safety', 1),
('mat-001b', 'sub-001', 'helmet_cards', 'Helmet Safety Cards', 75, 'sports_safety', 1),
('mat-002a', 'sub-002', 'water_safety_cards', 'Water Safety Cards', 50, 'water_safety', 1),
('mat-002b', 'sub-002', 'poison_prevention_magnets', 'Poison Prevention Magnets', 50, 'home_safety', 0),
('mat-003a', 'sub-003', 'water_safety_cards', 'Water Safety Cards', 80, 'water_safety', 1),
('mat-003b', 'sub-003', 'poison_prevention_magnets', 'Poison Prevention Magnets', 40, 'home_safety', 0),
('mat-004a', 'sub-004', 'safe_sleep_brochures', 'Safe Sleep Brochures', 30, 'infant_safety', 1),
('mat-004b', 'sub-004', 'medication_safety_cards', 'Medication Safety Cards', 30, 'home_safety', 1),
('mat-005a', 'sub-005', 'car_seat_cards', 'Car Seat Safety Cards', 200, 'vehicle_safety', 1),
('mat-005b', 'sub-005', 'bike_safety_stickers', 'Bike Safety Stickers', 300, 'sports_safety', 0),
('mat-005c', 'sub-005', 'pedestrian_safety_bookmarks', 'Pedestrian Safety Bookmarks', 350, 'vehicle_safety', 0),
('mat-006a', 'sub-006', 'safe_sleep_brochures', 'Safe Sleep Brochures', 45, 'infant_safety', 1),
('mat-006b', 'sub-006', 'poison_prevention_magnets', 'Poison Prevention Magnets', 45, 'home_safety', 0),
('mat-006c', 'sub-006', 'car_seat_cards', 'Car Seat Safety Cards', 45, 'vehicle_safety', 1),
('mat-007a', 'sub-007', 'helmet_cards', 'Helmet Safety Cards', 500, 'sports_safety', 1),
('mat-008a', 'sub-008', 'helmet_cards', 'Helmet Safety Cards', 120, 'sports_safety', 1),
('mat-008b', 'sub-008', 'first_aid_guides', 'First Aid Pocket Guides', 60, 'emergency', 1),
('mat-009a', 'sub-009', 'fire_safety_cards', 'Fire Safety Cards', 100, 'home_safety', 1),
('mat-009b', 'sub-009', 'poison_prevention_magnets', 'Poison Prevention Magnets', 100, 'home_safety', 0),
('mat-010a', 'sub-010', 'car_seat_cards', 'Car Seat Safety Cards', 100, 'vehicle_safety', 1),
('mat-010b', 'sub-010', 'water_safety_cards', 'Water Safety Cards', 50, 'water_safety', 1),
('mat-010c', 'sub-010', 'safe_sleep_brochures', 'Safe Sleep Brochures', 50, 'infant_safety', 1),
('mat-012a', 'sub-012', 'pedestrian_safety_bookmarks', 'Pedestrian Safety Bookmarks', 180, 'vehicle_safety', 0),
('mat-012b', 'sub-012', 'bike_safety_stickers', 'Bike Safety Stickers', 180, 'sports_safety', 0),
('mat-013a', 'sub-013', 'fire_safety_cards', 'Fire Safety Cards', 75, 'home_safety', 1),
('mat-013b', 'sub-013', 'safe_sleep_brochures', 'Safe Sleep Brochures', 75, 'infant_safety', 1),
('mat-014a', 'sub-014', 'helmet_cards', 'Helmet Safety Cards', 60, 'sports_safety', 1),
('mat-014b', 'sub-014', 'pedestrian_safety_bookmarks', 'Pedestrian Safety Bookmarks', 60, 'vehicle_safety', 0),
('mat-015a', 'sub-015', 'water_safety_cards', 'Water Safety Cards', 200, 'water_safety', 1),
('mat-015b', 'sub-015', 'bike_safety_stickers', 'Bike Safety Stickers', 150, 'sports_safety', 0),
('mat-015c', 'sub-015', 'sun_safety_cards', 'Sun Safety Cards', 200, 'outdoor_safety', 1),
('mat-018a', 'sub-018', 'water_safety_cards', 'Water Safety Cards', 100, 'water_safety', 1),
('mat-018b', 'sub-018', 'sun_safety_cards', 'Sun Safety Cards', 75, 'outdoor_safety', 1),
('mat-019a', 'sub-019', 'helmet_cards', 'Helmet Safety Cards', 75, 'sports_safety', 1),
('mat-019b', 'sub-019', 'bike_safety_stickers', 'Bike Safety Stickers', 75, 'sports_safety', 0),
('mat-019c', 'sub-019', 'pedestrian_safety_bookmarks', 'Pedestrian Safety Bookmarks', 50, 'vehicle_safety', 0),
('mat-020a', 'sub-020', 'fire_safety_cards', 'Fire Safety Cards', 100, 'home_safety', 1),
('mat-020b', 'sub-020', 'safe_sleep_brochures', 'Safe Sleep Brochures', 50, 'infant_safety', 1);


-- ===== SHIPPING (for mailing/both requests) =====

INSERT INTO shipping (id, submission_id, address_line1, city, state, zip, county) VALUES
('ship-002', 'sub-002', '25 S State St', 'Clearfield', 'UT', '84015', 'Davis'),
('ship-004', 'sub-004', '12450 Fort St', 'Draper', 'UT', '84020', 'Salt Lake'),
('ship-006', 'sub-006', '680 N 1200 W', 'Orem', 'UT', '84057', 'Utah'),
('ship-007', 'sub-007', '58 N State St', 'Orem', 'UT', '84057', 'Utah'),
('ship-010', 'sub-010', '155 S 300 W', 'Salt Lake City', 'UT', '84101', 'Salt Lake'),
('ship-013', 'sub-013', '2549 Washington Blvd', 'Ogden', 'UT', '84401', 'Weber'),
('ship-015', 'sub-015', '440 E 8680 S', 'Sandy', 'UT', '84070', 'Salt Lake'),
('ship-020', 'sub-020', '300 N 100 E', 'Lehi', 'UT', '84043', 'Utah');


-- ===== ACTIVITY LOG =====

INSERT INTO activity_log (id, submission_id, action, actor, details, created_at) VALUES
('log-001a', 'sub-001', 'submitted', 'system', '{"method":"form"}', '2026-03-18T09:15:00Z'),
('log-001b', 'sub-001', 'classified', 'ai', '{"confidence":96}', '2026-03-18T09:16:00Z'),
('log-001c', 'sub-001', 'auto_approved', 'ai', '{"reason":"All criteria met, confidence 96%"}', '2026-03-18T10:30:00Z'),
('log-001d', 'sub-001', 'email_sent', 'system', '{"type":"approval","to":"jmartinez@westside.edu"}', '2026-03-18T10:31:00Z'),

('log-005a', 'sub-005', 'submitted', 'system', '{"method":"upload"}', '2026-03-21T08:00:00Z'),
('log-005b', 'sub-005', 'classified', 'ai', '{"confidence":72,"flags":["Large attendance","Multiple topics"]}', '2026-03-21T08:01:00Z'),

('log-009a', 'sub-009', 'submitted', 'system', '{"method":"form"}', '2026-03-18T14:00:00Z'),
('log-009b', 'sub-009', 'classified', 'ai', '{"confidence":75}', '2026-03-18T14:01:00Z'),
('log-009c', 'sub-009', 'reviewed', 'Maria Gutierrez', '{"action":"opened for review"}', '2026-03-19T09:00:00Z'),

('log-012a', 'sub-012', 'submitted', 'system', '{"method":"form"}', '2026-03-14T08:00:00Z'),
('log-012b', 'sub-012', 'classified', 'ai', '{"confidence":81}', '2026-03-14T08:01:00Z'),
('log-012c', 'sub-012', 'approved', 'Maria Gutierrez', '{"note":"Approved for spring assembly"}', '2026-03-19T11:00:00Z'),
('log-012d', 'sub-012', 'email_sent', 'system', '{"type":"approval","to":"ntaylor@jordan.k12.ut.us"}', '2026-03-19T11:01:00Z'),

('log-014a', 'sub-014', 'submitted', 'system', '{"method":"form"}', '2026-03-05T13:00:00Z'),
('log-014b', 'sub-014', 'auto_approved', 'ai', '{"reason":"Standard school event, high confidence"}', '2026-03-08T10:00:00Z'),
('log-014c', 'sub-014', 'email_sent', 'system', '{"type":"approval","to":"edavis@canyons.edu"}', '2026-03-08T10:01:00Z'),
('log-014d', 'sub-014', 'digital_delivered', 'system', '{"materials":["helmet_cards","pedestrian_safety_bookmarks"]}', '2026-03-08T10:02:00Z'),
('log-014e', 'sub-014', 'fulfilled', 'Maria Gutierrez', '{"note":"Event completed successfully"}', '2026-03-13T15:00:00Z'),

('log-016a', 'sub-016', 'submitted', 'system', '{"method":"form"}', '2026-03-12T11:00:00Z'),
('log-016b', 'sub-016', 'classified', 'ai', '{"confidence":35,"flags":["Commercial entity","No community focus"]}', '2026-03-12T11:01:00Z'),
('log-016c', 'sub-016', 'denied', 'David Morales', '{"reason":"Not aligned with community health mission"}', '2026-03-13T09:00:00Z'),
('log-016d', 'sub-016', 'email_sent', 'system', '{"type":"denial","to":"jmiller@privateevent.com"}', '2026-03-13T09:01:00Z');
