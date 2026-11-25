-- Delete old admin accounts
delete from public.users where username in ('admin.gumaca', 'admin.campus');

-- Insert new admin accounts
insert into public.users (username, name, role, password, email, mobile, school, bio, address, emergency_contact, avatar, permit_no, permit_file, permit_status, account_status)
values
  ('gumaca.admin', 'Gumaca LGU Housing Admin', 'admin', 'Gum@c4#LGU_2026$', 'admin.housing@gumaca.gov.ph', '09190008888', 'Municipal Housing Regulatory Office', 'Authorized Municipal Housing Regulatory Officer for Gumaca, Quezon.', 'Municipal Hall, Brgy. San Diego, Gumaca, Quezon', 'Mayor''s Office (042-311-9999)', '🛡️', 'SYS-ADMIN-01', 'LGU_System_Auth.pdf', 'System Admin', 'approved'),
  ('campus.admin', 'Campus Housing Officer', 'admin', 'C@mpus#SL5U_2026$', 'housing.officer@slsu.edu.ph', '09190007777', 'SLSU & EQC Student Affairs Office', 'Official Student Housing Coordinator for SLSU & Eastern Quezon College.', 'SLSU Campus, Brgy. Mabini, Gumaca, Quezon', 'Campus Security (042-311-8888)', '👑', 'SYS-ADMIN-02', 'SLSU_Officer_Auth.pdf', 'System Admin', 'approved')
on conflict (username) do update set
  password = excluded.password,
  account_status = 'approved';
