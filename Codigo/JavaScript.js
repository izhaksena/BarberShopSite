
		const services = [
			{ id: 'corte', name: 'Corte masculino', description: 'Clássico, degradê ou do seu jeito.', price: 45, duration: 45, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=750&q=80' },
			{ id: 'barba', name: 'Barba', description: 'Desenho, toalha quente e cuidado.', price: 30, duration: 30, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=750&q=80' },
			{ id: 'combo', name: 'Corte + barba', description: 'O cuidado completo, sem pressa.', price: 68, duration: 75, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=750&q=80' },
			{ id: 'sobrancelha', name: 'Sobrancelha', description: 'Acabamento natural e preciso.', price: 20, duration: 20, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=750&q=80' }
		];
		const barbers = [
			{ id: 'joao', name: 'João Silva', specialty: 'Cortes clássicos e degradê', rating: '4,9', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80' },
			{ id: 'carlos', name: 'Carlos Lima', specialty: 'Barba e visagismo', rating: '5,0', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=180&q=80' },
			{ id: 'pedro', name: 'Pedro Santos', specialty: 'Cortes modernos', rating: '4,8', image: 'https://images.unsplash.com/photo-150700 muñño?auto=format&fit=crop&w=180&q=80' }
		];
		barbers[2].image = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80';
		const defaultAppointments = [
			{ id: 1, client: 'João Silva', service: 'Corte + barba', barber: 'Carlos Lima', date: nextDate(2), time: '10:00', price: 68, status: 'Confirmado' },
			{ id: 2, client: 'Pedro Santos', service: 'Corte masculino', barber: 'João Silva', date: nextDate(3), time: '14:00', price: 45, status: 'Confirmado' },
			{ id: 3, client: 'Lucas Alves', service: 'Barba', barber: 'Pedro Santos', date: nextDate(4), time: '15:00', price: 30, status: 'Confirmado' }
		];
		const state = { view: 'home', user: readStorage('barbeariaUser', null), bookingStep: 1, booking: { service: null, barber: null, date: '', time: '', name: '', phone: '' }, role: 'cliente', dashboardSection: 'overview', cancelId: null };
		let appointments = readStorage('barbeariaAppointments', defaultAppointments);
		function nextDate(offset) { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().slice(0, 10); }
		function readStorage(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
		function saveStorage() { localStorage.setItem('barbeariaAppointments', JSON.stringify(appointments)); }
		function money(value) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
		function formatDate(date, options = { day: '2-digit', month: 'short' }) { if (!date) return 'A escolher'; return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', options).replace('.', ''); }
		function icon(name, extra = '') { return `<i class="icon ${extra}" data-lucide="${name}"></i>`; }
		function refreshIcons() { if (window.lucide) lucide.createIcons(); }
		function showToast(message) { document.getElementById('toastMessage').textContent = message; const toast = document.getElementById('toast'); toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200); }
		function renderHome() {
			document.getElementById('homeServices').innerHTML = services.map((service, index) => `<article class="service-card"><div class="service-photo"><img src="${service.image}" alt="${service.name}" loading="lazy"><span class="service-index">0${index + 1}</span></div><div class="service-info"><h3>${service.name}</h3><p>${service.description}</p><div class="service-meta"><strong>${money(service.price)}</strong><span>${icon('clock-3', 'icon-sm')} ${service.duration} min</span></div></div></article>`).join('');
			document.getElementById('homeBarbers').innerHTML = barbers.map(barber => `<article class="barber-card"><img src="${barber.image}" alt="${barber.name}" loading="lazy"><div><h3>${barber.name}</h3><p>${barber.specialty}</p><div class="barber-stars">${icon('star', 'icon-sm')} ${barber.rating} <span>·</span> ${icon('scissors', 'icon-sm')} Profissional</div></div></article>`).join('');
		}
		function navigate(view, scrollTo = true) {
			if (view === 'dashboard' && !state.user) view = 'login';
			state.view = view;
			document.querySelectorAll('.view').forEach(section => section.classList.toggle('active', section.id === `view-${view}`));
			document.querySelectorAll('.main-nav a').forEach(link => link.classList.toggle('active', link.dataset.view === view));
			document.getElementById('mainNav').classList.remove('open'); document.getElementById('mobileToggle').setAttribute('aria-expanded', 'false');
			if (view === 'booking') renderBooking();
			if (view === 'dashboard') renderDashboard();
			if (scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
			refreshIcons();
		}
		function updateUser() {
			const chip = document.getElementById('userChip');
			chip.classList.toggle('visible', Boolean(state.user));
			document.querySelector('[data-action="login"]').style.display = state.user ? 'none' : '';
			if (state.user) { document.getElementById('userName').textContent = state.user.name.split(' ')[0]; document.getElementById('userAvatar').textContent = state.user.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
		}
		function setBookingStep(step) { state.bookingStep = Math.max(1, Math.min(4, step)); renderBooking(); }
		function renderBooking() {
			const steps = ['Serviço', 'Profissional', 'Data e hora', 'Confirmação'];
			document.getElementById('bookingStepper').innerHTML = steps.map((label, index) => `<div class="step ${state.bookingStep === index + 1 ? 'current' : ''} ${state.bookingStep > index + 1 ? 'done' : ''}"><span class="step-number">${state.bookingStep > index + 1 ? '✓' : index + 1}</span><span>${label}</span></div>`).join('');
			const content = document.getElementById('bookingStepContent');
			if (state.bookingStep === 1) content.innerHTML = `<h2>Qual vai ser?</h2><p>Escolha um serviço para ver o valor e a duração.</p><div class="choice-grid">${services.map(service => `<button class="choice-card ${state.booking.service?.id === service.id ? 'selected' : ''}" data-service="${service.id}"><img class="choice-thumb" src="${service.image}" alt="" loading="lazy"><span class="choice-copy"><strong>${service.name}</strong><span>${service.duration} min · ${service.description}</span></span><span class="choice-price">${money(service.price)}</span><span class="radio-mark"></span></button>`).join('')}</div>`;
			if (state.bookingStep === 2) content.innerHTML = `<h2>Com quem você quer agendar?</h2><p>Escolha seu profissional preferido ou deixe a gente encontrar o primeiro horário.</p><div class="choice-grid"><button class="choice-card ${state.booking.barber === 'Qualquer profissional' ? 'selected' : ''}" data-barber="Qualquer profissional"><span class="choice-thumb" style="display:grid;place-items:center;background:#edf1e7;color:var(--green)">${icon('users-round')}</span><span class="choice-copy"><strong>Sem preferência</strong><span>Mais opções de horário</span></span><span class="radio-mark"></span></button>${barbers.map(barber => `<button class="choice-card ${state.booking.barber === barber.name ? 'selected' : ''}" data-barber="${barber.name}"><img class="choice-thumb" src="${barber.image}" alt="" loading="lazy"><span class="choice-copy"><strong>${barber.name}</strong><span>${barber.specialty}</span></span><span class="radio-mark"></span></button>`).join('')}</div>`;
			if (state.bookingStep === 3) content.innerHTML = `<h2>Quando fica melhor?</h2><p>Selecione um dia e depois escolha um horário disponível.</p><div class="field-grid"><label class="field">Seu nome<input id="bookingName" value="${state.booking.name || state.user?.name || ''}" placeholder="Como podemos chamar você?" autocomplete="name"></label><label class="field">Celular<input id="bookingPhone" value="${state.booking.phone || ''}" type="tel" placeholder="(31) 99999-9999" autocomplete="tel"></label></div><div class="calendar-shell"><div class="calendar-heading"><button aria-label="Semana anterior" disabled>${icon('chevron-left', 'icon-sm')}</button><span>Próximos dias</span><button aria-label="Próxima semana" data-action="next-week">${icon('chevron-right', 'icon-sm')}</button></div><div class="date-options" id="dateOptions"></div></div><div class="time-title">Horários disponíveis</div><div class="time-options" id="timeOptions"></div>`;
			if (state.bookingStep === 4) {
				const booking = state.booking;
				content.innerHTML = `<h2>Quase lá, ${booking.name.split(' ')[0] || 'tudo certo'}.</h2><p>Confira os detalhes antes de confirmar seu horário.</p><div style="padding:18px;border:1px solid var(--line);background:#fff"><p class="summary-label"><span>Serviço</span><strong>${booking.service?.name || '—'}</strong></p><p class="summary-label"><span>Profissional</span><strong>${booking.barber || '—'}</strong></p><p class="summary-label"><span>Data</span><strong>${formatDate(booking.date, { weekday: 'long', day: '2-digit', month: 'long' })}</strong></p><p class="summary-label"><span>Horário</span><strong>${booking.time || '—'}</strong></p><p class="summary-label"><span>Cliente</span><strong>${booking.name} · ${booking.phone}</strong></p><div class="summary-total"><span>Total no local</span><strong>${money(booking.service?.price || 0)}</strong></div></div><p style="margin:15px 0 0;color:#818780;font-size:10px">O pagamento é realizado na barbearia, após o atendimento. Você poderá cancelar pelo seu painel.</p>`;
			}
			document.getElementById('bookingBack').disabled = state.bookingStep === 1;
			document.getElementById('bookingNext').innerHTML = state.bookingStep === 4 ? `Confirmar agendamento ${icon('check', 'icon-sm')}` : `Continuar ${icon('arrow-right', 'icon-sm')}`;
			document.getElementById('bookingNext').disabled = (state.bookingStep === 1 && !state.booking.service) || (state.bookingStep === 2 && !state.booking.barber) || (state.bookingStep === 3 && (!state.booking.date || !state.booking.time));
			updateSummary();
			if (state.bookingStep === 3) { renderDateOptions(); renderTimeOptions(); }
			refreshIcons();
		}
		function updateSummary() {
			const service = state.booking.service;
			document.getElementById('summaryService').textContent = service?.name || 'Selecione um serviço';
			document.getElementById('summaryBarber').textContent = state.booking.barber || 'A escolher';
			document.getElementById('summaryDate').textContent = state.booking.date ? `${formatDate(state.booking.date)} · ${state.booking.time || 'horário pendente'}` : 'A escolher';
			document.getElementById('summaryPrice').textContent = money(service?.price || 0);
			document.getElementById('summaryImage').src = service?.image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=75';
		}
		function renderDateOptions() {
			const base = new Date(); base.setHours(12, 0, 0, 0);
			document.getElementById('dateOptions').innerHTML = Array.from({ length: 7 }, (_, index) => { const date = new Date(base); date.setDate(date.getDate() + index + 1); const iso = date.toISOString().slice(0, 10); return `<button class="date-option ${state.booking.date === iso ? 'selected' : ''}" data-date="${iso}"><span>${date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span><strong>${date.getDate()}</strong></button>`; }).join('');
		}
		function renderTimeOptions() {
			const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
			const unavailable = appointments.filter(item => item.date === state.booking.date && item.status !== 'Cancelado').map(item => item.time);
			document.getElementById('timeOptions').innerHTML = state.booking.date ? times.map(time => `<button class="time-option ${state.booking.time === time ? 'selected' : ''}" data-time="${time}" ${unavailable.includes(time) ? 'disabled title="Horário indisponível"' : ''}>${time}</button>`).join('') : '<span style="color:#848a82;font-size:10px">Escolha uma data para ver os horários.</span>';
		}
		function getMenuItems() {
			if (state.user?.role === 'gestor') return [['overview','layout-dashboard','Visão geral'],['appointments','calendar-days','Agendamentos'],['clients','users-round','Clientes'],['services','scissors','Serviços'],['team','user-round-cog','Profissionais'],['reports','chart-no-axes-column-increasing','Relatórios']];
			if (state.user?.role === 'barbeiro') return [['agenda','calendar-days','Minha agenda'],['history','history','Atendimentos']];
			return [['overview','calendar-days','Meus agendamentos'],['profile','user-round','Meu perfil']];
		}
		function renderDashboard() {
			if (!state.user) return navigate('login', false);
			const role = state.user.role;
			const config = role === 'gestor' ? ['Painel administrativo', 'Visão geral', 'Acompanhe os números e a rotina da barbearia.'] : role === 'barbeiro' ? ['Área do profissional', 'Minha agenda', 'Sua agenda de atendimentos e atualizações de status.'] : ['Sua área', 'Meus agendamentos', 'Acompanhe seus próximos momentos na barbearia.'];
			document.getElementById('dashboardKicker').textContent = config[0]; document.getElementById('dashboardTitle').textContent = state.dashboardSection === 'overview' && role === 'cliente' ? config[1] : getMenuItems().find(item => item[0] === state.dashboardSection)?.[2] || config[1]; document.getElementById('dashboardSubtitle').textContent = config[2];
			const menu = getMenuItems(); if (!menu.some(item => item[0] === state.dashboardSection)) state.dashboardSection = menu[0][0];
			document.getElementById('sideMenu').innerHTML = menu.map(([id, iconName, label]) => `<button class="${state.dashboardSection === id ? 'selected' : ''}" data-dashboard-section="${id}">${icon(iconName)}<span>${label}</span></button>`).join('');
			const content = document.getElementById('dashboardContent');
			if (role === 'gestor') renderAdminContent(content);
			else if (role === 'barbeiro') renderBarberContent(content);
			else renderClientContent(content);
			document.querySelector('[data-view="booking"]', document.querySelector('.dashboard-head')).style.display = role === 'cliente' ? '' : 'none';
			refreshIcons();
		}
		function renderClientContent(content) {
			const mine = appointments.filter(item => item.client === state.user.name);
			if (state.dashboardSection === 'profile') { content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Meu perfil</h2></div><div class="field-grid"><label class="field">Nome<input value="${state.user.name}" disabled></label><label class="field">E-mail<input value="${state.user.email}" disabled></label></div><p style="color:#838980;font-size:10px;margin:15px 0 0">As informações de perfil estarão disponíveis quando a autenticação estiver conectada ao servidor.</p></div>`; return; }
			content.innerHTML = `<div class="panel-title"><h2>Próximos horários</h2><button class="subtle-link" data-view="booking">Novo agendamento +</button></div><div class="panel-surface">${mine.length ? `<div class="upcoming-list">${mine.map(item => appointmentRow(item, true)).join('')}</div>` : `<div class="empty-state">${icon('calendar-days')}<strong>Nenhum horário por enquanto</strong><span>Seu próximo corte pode começar com um clique.</span><button class="button button-dark" style="margin-top:14px" data-view="booking">Agendar horário</button></div>`}</div><div style="margin-top:14px" class="panel-surface"><div class="panel-title"><h2>Seu histórico</h2><span style="font-size:9px;color:#818780">Atendimentos recentes</span></div>${mine.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>SERVIÇO</th><th>PROFISSIONAL</th><th>DATA</th><th>VALOR</th><th>STATUS</th></tr></thead><tbody>${mine.map(item => `<tr><td>${item.service}</td><td>${item.barber}</td><td>${formatDate(item.date)}</td><td>${money(item.price)}</td><td>${statusBadge(item.status)}</td></tr>`).join('')}</tbody></table></div>` : '<p style="color:#818780;font-size:10px">Seus atendimentos concluídos aparecem aqui.</p>'}</div>`;
		}
		function appointmentRow(item, canCancel) {
			const date = new Date(`${item.date}T12:00:00`);
			return `<div class="upcoming-row"><div class="date-block"><strong>${date.getDate()}</strong><small>${date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small></div><div class="appointment-detail"><strong>${item.service}</strong><span>${item.time} · ${item.barber}</span></div><div>${item.status === 'Cancelado' ? statusBadge(item.status) : canCancel ? `<button class="small-action" data-cancel="${item.id}" aria-label="Cancelar ${item.service}">Cancelar</button>` : statusBadge(item.status)}</div></div>`;
		}
		function statusBadge(status) { const cls = status === 'Cancelado' ? 'cancelled' : status === 'Concluído' ? 'completed' : status === 'Em atendimento' ? 'in-progress' : ''; return `<span class="status ${cls}">${status}</span>`; }
		function renderBarberContent(content) {
			const agenda = [...appointments].sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
			if (state.dashboardSection === 'history') { content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Atendimentos recentes</h2></div><div class="table-wrap"><table class="data-table"><thead><tr><th>CLIENTE</th><th>SERVIÇO</th><th>DATA</th><th>VALOR</th><th>STATUS</th></tr></thead><tbody>${agenda.map(item => `<tr><td>${item.client}</td><td>${item.service}</td><td>${formatDate(item.date)}</td><td>${money(item.price)}</td><td>${statusBadge(item.status)}</td></tr>`).join('')}</tbody></table></div></div>`; return; }
			content.innerHTML = `<div class="metric-grid"><article class="metric-card"><div class="metric-head">Hoje<span class="metric-icon">${icon('calendar-days')}</span></div><strong>${agenda.filter(item => item.date === nextDate(0)).length || 4}</strong><small>atendimentos na agenda</small></article><article class="metric-card"><div class="metric-head">Concluídos<span class="metric-icon">${icon('circle-check')}</span></div><strong>${agenda.filter(item => item.status === 'Concluído').length + 8}</strong><small>neste mês</small></article><article class="metric-card"><div class="metric-head">Próximo<span class="metric-icon">${icon('clock-3')}</span></div><strong style="font-size:20px">10:00</strong><small>Corte + barba · João Silva</small></article></div><div class="panel-title"><h2>Agenda de hoje</h2><span style="font-size:10px;color:#818780">${formatDate(nextDate(0), { weekday:'long', day:'2-digit', month:'long' })}</span></div><div class="day-agenda">${agenda.slice(0, 5).map(item => `<article class="agenda-item"><div class="agenda-time">${item.time}</div><div><h3>${item.client}</h3><p>${item.service} · ${money(item.price)}</p></div><div class="agenda-actions">${item.status === 'Confirmado' ? `<button class="small-action primary" data-status="${item.id}" data-next-status="Em atendimento">Iniciar</button>` : item.status === 'Em atendimento' ? `<button class="small-action primary" data-status="${item.id}" data-next-status="Concluído">Finalizar</button>` : statusBadge(item.status)}</div></article>`).join('')}</div>`;
		}
		function renderAdminContent(content) {
			const section = state.dashboardSection;
			if (section === 'appointments') { content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Todos os agendamentos</h2></div><div class="toolbar"><label class="search-field">${icon('search')}<input id="adminSearch" placeholder="Buscar cliente ou serviço"></label><select class="filter-select" id="statusFilter"><option value="Todos">Todos os status</option><option>Confirmado</option><option>Concluído</option><option>Cancelado</option></select></div><div id="adminTable"></div></div>`; renderAdminTable(); return; }
			if (section === 'clients') { const clients = [...new Set(appointments.map(item => item.client))]; content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Clientes cadastrados</h2><span class="status">${128 + clients.length} clientes</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>CLIENTE</th><th>ÚLTIMO SERVIÇO</th><th>PROFISSIONAL</th><th>PRÓXIMO HORÁRIO</th></tr></thead><tbody>${appointments.map(item => `<tr><td><div class="client-cell"><span class="avatar">${item.client.split(' ').map(part=>part[0]).slice(0,2).join('')}</span>${item.client}</div></td><td>${item.service}</td><td>${item.barber}</td><td>${formatDate(item.date)} · ${item.time}</td></tr>`).join('')}</tbody></table></div></div>`; return; }
			if (section === 'services') { content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Catálogo de serviços</h2><button class="button button-dark" data-action="add-service"><i class="icon icon-sm" data-lucide="plus"></i> Novo serviço</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>SERVIÇO</th><th>DURAÇÃO</th><th>PREÇO</th><th>STATUS</th></tr></thead><tbody>${services.map(service => `<tr><td>${service.name}</td><td>${service.duration} min</td><td>${money(service.price)}</td><td><span class="status">Ativo</span></td></tr>`).join('')}</tbody></table></div></div>`; return; }
			if (section === 'team') { content.innerHTML = `<div class="panel-surface"><div class="panel-title"><h2>Profissionais</h2><button class="button button-dark" data-action="team-info"><i class="icon icon-sm" data-lucide="plus"></i> Novo profissional</button></div><div class="barber-grid" style="grid-template-columns:1fr 1fr">${barbers.map(barber => `<article class="barber-card"><img src="${barber.image}" alt="${barber.name}"><div><h3>${barber.name}</h3><p>${barber.specialty}</p><div class="barber-stars">${icon('star', 'icon-sm')} ${barber.rating} · Ativo</div></div></article>`).join('')}</div></div>`; return; }
			if (section === 'reports') { content.innerHTML = `<div class="metric-grid"><article class="metric-card"><div class="metric-head">Faturamento no mês<span class="metric-icon">${icon('wallet')}</span></div><strong>R$ 4.250</strong><small>+12% em relação ao mês passado</small></article><article class="metric-card"><div class="metric-head">Atendimentos<span class="metric-icon">${icon('calendar-check-2')}</span></div><strong>128</strong><small>no período selecionado</small></article><article class="metric-card"><div class="metric-head">Ticket médio<span class="metric-icon">${icon('receipt')}</span></div><strong>R$ 58</strong><small>por atendimento</small></article></div><div class="dashboard-panels"><div class="panel-surface"><div class="panel-title"><h2>Faturamento por semana</h2><select class="filter-select"><option>Este mês</option><option>Últimos 3 meses</option></select></div><div class="report-chart">${[['Sem 1',55],['Sem 2',78],['Sem 3',62],['Sem 4',92]].map(([label,height])=>`<div class="bar-col"><span style="height:${height}%"></span>${label}</div>`).join('')}</div></div><div class="panel-surface"><div class="panel-title"><h2>Agendamentos por status</h2></div><div class="donut-wrap"><div class="donut"></div><div class="legend"><span><i></i>Confirmado 62%</span><span><i></i>Pendente 22%</span><span><i></i>Cancelado 16%</span></div></div></div></div>`; return; }
			if (section === 'appointments') return;
			if (section !== 'overview') { state.dashboardSection = 'overview'; }
			content.innerHTML = `<div class="metric-grid"><article class="metric-card"><div class="metric-head">Agendamentos hoje<span class="metric-icon">${icon('calendar-days')}</span></div><strong>12</strong><small>3 próximos nas próximas horas</small></article><article class="metric-card"><div class="metric-head">Clientes<span class="metric-icon">${icon('users-round')}</span></div><strong>128</strong><small>8 novos este mês</small></article><article class="metric-card"><div class="metric-head">Faturamento (mês)<span class="metric-icon">${icon('wallet')}</span></div><strong style="font-size:21px">R$ 4.250</strong><small>+12% vs. mês anterior</small></article></div><div class="dashboard-panels"><div class="panel-surface"><div class="panel-title"><h2>Próximos atendimentos</h2><button class="subtle-link" data-dashboard-section="appointments">Ver todos</button></div><div class="upcoming-list">${appointments.slice(0,4).map(item => `<div class="upcoming-row"><div class="date-block"><strong>${item.time}</strong><small>${formatDate(item.date)}</small></div><div class="appointment-detail"><strong>${item.client}</strong><span>${item.barber} · ${item.service}</span></div>${statusBadge(item.status)}</div>`).join('')}</div></div><div class="panel-surface"><div class="panel-title"><h2>Serviços mais procurados</h2><button class="subtle-link" data-dashboard-section="reports">Relatórios</button></div><div class="service-rank">${[['Corte masculino','78%',78],['Corte + barba','62%',62],['Barba','44%',44]].map(([name,percent,width])=>`<div><div class="rank-label"><strong>${name}</strong><span>${percent}</span></div><div class="progress-track"><span style="width:${width}%"></span></div></div>`).join('')}</div><div style="margin-top:19px;padding-top:15px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><span style="font-size:10px;color:#59645d">Ocupação da semana</span><strong style="font:800 18px Manrope">76%</strong></div></div></div><div class="panel-surface" style="margin-top:14px"><div class="panel-title"><h2>Agendamentos recentes</h2><button class="subtle-link" data-dashboard-section="appointments">Ver todos</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>CLIENTE</th><th>SERVIÇO</th><th>PROFISSIONAL</th><th>DATA</th><th>HORÁRIO</th><th>STATUS</th></tr></thead><tbody>${appointments.slice(0,4).map(item=>`<tr><td>${item.client}</td><td>${item.service}</td><td>${item.barber}</td><td>${formatDate(item.date)}</td><td>${item.time}</td><td>${statusBadge(item.status)}</td></tr>`).join('')}</tbody></table></div></div>`;
		}
		function renderAdminTable() {
			const search = (document.getElementById('adminSearch')?.value || '').toLowerCase(); const status = document.getElementById('statusFilter')?.value || 'Todos';
			const rows = appointments.filter(item => (status === 'Todos' || item.status === status) && `${item.client} ${item.service} ${item.barber}`.toLowerCase().includes(search));
			const target = document.getElementById('adminTable'); if (!target) return;
			target.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>CLIENTE</th><th>SERVIÇO</th><th>PROFISSIONAL</th><th>DATA</th><th>HORÁRIO</th><th>VALOR</th><th>STATUS</th></tr></thead><tbody>${rows.length ? rows.map(item=>`<tr><td>${item.client}</td><td>${item.service}</td><td>${item.barber}</td><td>${formatDate(item.date)}</td><td>${item.time}</td><td>${money(item.price)}</td><td>${statusBadge(item.status)}</td></tr>`).join('') : '<tr><td colspan="7">Nenhum agendamento encontrado.</td></tr>'}</tbody></table></div>`;
		}
		function openModal(title, text, confirmLabel, onConfirm) {
			document.getElementById('modalTitle').textContent = title; document.getElementById('modalText').textContent = text; document.getElementById('modalConfirm').textContent = confirmLabel; document.getElementById('modalBackdrop').classList.add('open');
			document.getElementById('modalConfirm').onclick = () => { document.getElementById('modalBackdrop').classList.remove('open'); onConfirm(); };
		}
		document.addEventListener('click', event => {
			const viewButton = event.target.closest('[data-view]'); if (viewButton) { event.preventDefault(); navigate(viewButton.dataset.view); return; }
			const scrollLink = event.target.closest('[data-scroll]'); if (scrollLink) { event.preventDefault(); if (state.view !== 'home') navigate('home', false); document.getElementById(scrollLink.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('mainNav').classList.remove('open'); return; }
			const serviceChoice = event.target.closest('[data-service]'); if (serviceChoice) { state.booking.service = services.find(service=>service.id === serviceChoice.dataset.service); renderBooking(); return; }
			const barberChoice = event.target.closest('[data-barber]'); if (barberChoice) { state.booking.barber = barberChoice.dataset.barber; renderBooking(); return; }
			const dateChoice = event.target.closest('[data-date]'); if (dateChoice) { state.booking.date = dateChoice.dataset.date; state.booking.time = ''; renderBooking(); return; }
			const timeChoice = event.target.closest('[data-time]'); if (timeChoice && !timeChoice.disabled) { state.booking.time = timeChoice.dataset.time; renderBooking(); return; }
			const roleChoice = event.target.closest('[data-role]'); if (roleChoice) { state.role = roleChoice.dataset.role; document.querySelectorAll('.role-tab').forEach(tab=>tab.classList.toggle('selected', tab === roleChoice)); return; }
			const sectionChoice = event.target.closest('[data-dashboard-section]'); if (sectionChoice) { state.dashboardSection = sectionChoice.dataset.dashboardSection; renderDashboard(); return; }
			const cancelButton = event.target.closest('[data-cancel]'); if (cancelButton) { const appointment = appointments.find(item=>item.id === Number(cancelButton.dataset.cancel)); state.cancelId = Number(cancelButton.dataset.cancel); openModal('Cancelar agendamento?', `Deseja cancelar ${appointment?.service} no dia ${formatDate(appointment?.date)} às ${appointment?.time}?`, 'Cancelar horário', () => { const item = appointments.find(entry=>entry.id === state.cancelId); if (item) item.status = 'Cancelado'; saveStorage(); renderDashboard(); showToast('Agendamento cancelado.'); }); return; }
			const statusButton = event.target.closest('[data-status]'); if (statusButton) { const item = appointments.find(entry=>entry.id === Number(statusButton.dataset.status)); if (item) item.status = statusButton.dataset.nextStatus; saveStorage(); renderDashboard(); showToast(item.status === 'Concluído' ? 'Atendimento finalizado.' : 'Atendimento iniciado.'); return; }
			const action = event.target.closest('[data-action]')?.dataset.action;
			if (action === 'login') navigate('login');
			if (action === 'dashboard') { state.dashboardSection = state.user?.role === 'barbeiro' ? 'agenda' : 'overview'; navigate('dashboard'); }
			if (action === 'logout') { state.user = null; localStorage.removeItem('barbeariaUser'); updateUser(); navigate('home'); showToast('Você saiu da sua conta.'); }
			if (action === 'close-modal') document.getElementById('modalBackdrop').classList.remove('open');
			if (action === 'forgot') showToast('Recuperação de senha estará disponível na versão conectada ao servidor.');
			if (action === 'register') showToast('O cadastro estará disponível na versão conectada ao servidor.');
			if (action === 'add-service') showToast('Cadastro de serviço será conectado ao banco de dados na próxima etapa.');
			if (action === 'team-info') showToast('Cadastro de profissionais será conectado ao banco de dados na próxima etapa.');
			if (action === 'next-week') showToast('Os horários são exibidos para os próximos sete dias.');
		});
		document.getElementById('bookingBack').addEventListener('click', () => setBookingStep(state.bookingStep - 1));
		document.getElementById('bookingNext').addEventListener('click', () => {
			if (state.bookingStep < 3) { setBookingStep(state.bookingStep + 1); return; }
			if (state.bookingStep === 3) {
				state.booking.name = document.getElementById('bookingName')?.value.trim() || '';
				state.booking.phone = document.getElementById('bookingPhone')?.value.trim() || '';
				if (!state.booking.name || !state.booking.phone) { showToast('Informe seu nome e celular para continuar.'); return; }
				setBookingStep(4); return;
			}
			const appointment = { id: Date.now(), client: state.booking.name, service: state.booking.service.name, barber: state.booking.barber === 'Qualquer profissional' ? barbers[0].name : state.booking.barber, date: state.booking.date, time: state.booking.time, price: state.booking.service.price, status: 'Confirmado' };
			appointments.push(appointment); saveStorage();
			if (!state.user) { state.user = { name: appointment.client, email: '', role: 'cliente' }; localStorage.setItem('barbeariaUser', JSON.stringify(state.user)); updateUser(); }
			state.dashboardSection = 'overview'; state.booking = { service: null, barber: null, date: '', time: '', name: '', phone: '' }; state.bookingStep = 1;
			navigate('dashboard'); showToast('Horário confirmado. Até breve!');
		});
		document.getElementById('loginForm').addEventListener('submit', event => {
			event.preventDefault(); const email = document.getElementById('loginEmail').value.trim();
			const names = { cliente: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, letter=>letter.toUpperCase()) || 'João Silva', barbeiro: 'João Silva', gestor: 'Mariana Costa' };
			const name = state.role === 'cliente' && names.cliente.length > 2 ? names.cliente : names[state.role];
			state.user = { name, email, role: state.role }; localStorage.setItem('barbeariaUser', JSON.stringify(state.user)); updateUser(); state.dashboardSection = state.role === 'barbeiro' ? 'agenda' : 'overview'; navigate('dashboard'); showToast(`Bem-vindo, ${name.split(' ')[0]}!`);
		});
		document.getElementById('passwordToggle').addEventListener('click', () => { const input = document.getElementById('loginPassword'); input.type = input.type === 'password' ? 'text' : 'password'; });
		document.getElementById('mobileToggle').addEventListener('click', event => { const nav = document.getElementById('mainNav'); const open = nav.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', String(open)); });
		document.addEventListener('input', event => { if (event.target.id === 'bookingName') state.booking.name = event.target.value; if (event.target.id === 'bookingPhone') state.booking.phone = event.target.value; if (event.target.id === 'adminSearch') renderAdminTable(); });
		document.addEventListener('change', event => { if (event.target.id === 'statusFilter') renderAdminTable(); });
		document.addEventListener('keydown', event => { if (event.key === 'Escape') document.getElementById('modalBackdrop').classList.remove('open'); });
		renderHome(); updateUser();
		if (state.user) { state.dashboardSection = state.user.role === 'barbeiro' ? 'agenda' : 'overview'; }
		refreshIcons();
	