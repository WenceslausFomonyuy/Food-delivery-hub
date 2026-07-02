
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url text;

UPDATE public.menu_items SET image_url = CASE name
  -- Oak-Fired Pies
  WHEN 'Margherita' THEN 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800&auto=format&fit=crop'
  WHEN 'The White Pie' THEN 'https://images.unsplash.com/photo-1571066811602-716837d681de?w=800&auto=format&fit=crop'
  WHEN 'Ricky Ricotta' THEN 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=800&auto=format&fit=crop'
  WHEN 'Burrata Banger' THEN 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop'
  WHEN 'Diavola' THEN 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop'
  WHEN 'Funghi' THEN 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=800&auto=format&fit=crop'
  -- Mains
  WHEN 'Calzone Classico' THEN 'https://images.unsplash.com/photo-1536964549204-cce9eab227bd?w=800&auto=format&fit=crop'
  WHEN 'Eggplant Parmigiana' THEN 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&auto=format&fit=crop'
  -- Antipasti
  WHEN 'Burrata' THEN 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop'
  WHEN 'Arancini' THEN 'https://images.unsplash.com/photo-1633436374961-09b92742047b?w=800&auto=format&fit=crop'
  WHEN 'Charcuterie Board' THEN 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&auto=format&fit=crop'
  WHEN 'Caesar Salad' THEN 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop'
  -- Dolci
  WHEN 'Cannoli' THEN 'https://images.unsplash.com/photo-1607478900766-efe13248b125?w=800&auto=format&fit=crop'
  WHEN 'Tiramisu' THEN 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop'
  WHEN 'Affogato' THEN 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=800&auto=format&fit=crop'
  -- American Favorites
  WHEN 'Classic Cheeseburger' THEN 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop'
  WHEN 'Bacon Cheeseburger' THEN 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop'
  WHEN 'Crispy Chicken Sandwich' THEN 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&auto=format&fit=crop'
  WHEN 'Buffalo Wings (8 pc)' THEN 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&auto=format&fit=crop'
  WHEN 'BBQ Wings (8 pc)' THEN 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop'
  WHEN 'Chicken Tenders (5 pc)' THEN 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop'
  WHEN 'Philly Cheesesteak' THEN 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&auto=format&fit=crop'
  WHEN 'All-American Hot Dog' THEN 'https://images.unsplash.com/photo-1612392061787-2d078b3e573c?w=800&auto=format&fit=crop'
  WHEN 'Loaded Nachos' THEN 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&auto=format&fit=crop'
  WHEN 'Mac & Cheese' THEN 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop'
  WHEN 'Classic Fries' THEN 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop'
  WHEN 'Loaded Cheese Fries' THEN 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&auto=format&fit=crop'
  WHEN 'Onion Rings' THEN 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&auto=format&fit=crop'
  WHEN 'Mozzarella Sticks (6 pc)' THEN 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800&auto=format&fit=crop'
  WHEN 'Chocolate Milkshake' THEN 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop'
  ELSE image_url
END;
