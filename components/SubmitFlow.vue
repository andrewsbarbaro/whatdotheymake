<template>
  <div class="submit-flow">
    <div class="progress">
      <div class="progress-bar" :style="{ width: `${(step / totalSteps) * 100}%` }" />
    </div>

    <div class="flow-inner">
      <Transition name="slide" mode="out-in">
        <div :key="step" class="step">

          <!-- STEP 1: Job Title -->
          <template v-if="step === 1">
            <div class="step-emoji">💼</div>
            <h2 class="step-question">What is your job title?</h2>
            <p class="step-hint">Share the role that best matches your current work.</p>
            <div class="field-stack">
              <div class="field-wrap">
                <input
                  v-model="form.job_title"
                  type="text"
                  class="step-input"
                  maxlength="150"
                  :class="{ 'input-error': hasFieldError('job_title') }"
                  placeholder="Software Engineer, Nurse, Product Manager..."
                  autofocus
                  @input="onJobTitleInput"
                  @focus="onJobTitleFocus"
                  @blur="onJobTitleBlur"
                  @keyup.enter="next"
                />
                <span v-if="hasFieldError('job_title')" class="field-warn" title="Needs changes">⚠</span>
              </div>
              <div v-if="showJobTitleSuggestions && jobTitleSuggestions.length > 0" class="suggestions-menu">
                <button
                  v-for="s in jobTitleSuggestions"
                  :key="s"
                  type="button"
                  class="suggestion-item"
                  @mousedown.prevent="selectJobTitleSuggestion(s)"
                >
                  {{ s }}
                </button>
              </div>
              <p v-if="hasFieldError('job_title')" class="field-error-msg">{{ fieldErrorMessage('job_title') }}</p>
            </div>
            <button class="btn-primary step-next" @click="next" :disabled="!form.job_title.trim()">Next →</button>
          </template>

          <!-- STEP 2: Pay (salary vs hourly) -->
          <template v-else-if="step === 2">
            <div class="step-emoji">💸</div>
            <h2 class="step-question">What is your base pay?</h2>
            <p class="step-hint">Enter base cash pay before taxes (not total comp).</p>

            <div class="pay-toggle">
              <button class="pay-toggle-btn" :class="{ active: form.pay_type === 'salary' }" @click="switchPayType('salary')">Salary</button>
              <button class="pay-toggle-btn" :class="{ active: form.pay_type === 'hourly' }" @click="switchPayType('hourly')">Hourly</button>
            </div>

            <div v-if="form.pay_type === 'salary'" class="salary-input-wrap">
              <span class="salary-prefix">$</span>
              <input v-model="salaryDisplay" type="text" inputmode="numeric" class="step-input salary-input" placeholder="70,000" autofocus @keyup.enter="next" @input="onSalaryInput" />
              <span class="salary-suffix">/yr</span>
            </div>
            <div v-else class="salary-input-wrap">
              <span class="salary-prefix">$</span>
              <input v-model="hourlyDisplay" type="text" inputmode="numeric" class="step-input salary-input" placeholder="35" autofocus @keyup.enter="next" @input="onHourlyInput" />
              <span class="salary-suffix">/hr</span>
            </div>

            <p v-if="form.pay_type === 'hourly' && form.salary" class="hourly-calc">
              That's ~${{ formatNum(form.salary) }}/yr <span class="hourly-note">(40hr/wk × 52wk)</span>
            </p>

            <div class="bonus-wrap">
              <div class="bonus-label">Currency</div>
              <div class="bonus-input-wrap">
                <select
                  v-model="form.currency_code"
                  class="step-input bonus-input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>
            </div>

            <div class="bonus-wrap">
              <div class="bonus-label">Bonus % <span class="bonus-optional">(optional)</span></div>
              <div class="bonus-input-wrap">
                <input
                  v-model="bonusDisplay"
                  type="text"
                  inputmode="numeric"
                  class="step-input bonus-input"
                  placeholder="10"
                  @input="onBonusInput"
                />
                <span class="bonus-suffix">%</span>
              </div>
              <p class="bonus-hint">Just the % of base pay (not stock).</p>
            </div>
            <div class="comp-details">
              <button type="button" class="comp-details-toggle" @click="showCompDetails = !showCompDetails">
                {{ showCompDetails ? 'Hide role & equity details' : 'Add role & equity details (optional)' }}
              </button>

              <div v-if="showCompDetails" class="comp-details-panel">
                <div class="bonus-wrap">
                  <div class="bonus-label">Level / seniority <span class="bonus-optional">(optional)</span></div>
                  <div class="bonus-input-wrap">
                    <input
                      v-model="form.level"
                      type="text"
                      class="step-input"
                      maxlength="80"
                      placeholder="L4, Senior, Staff, Principal..."
                      @keyup.enter="next"
                    />
                  </div>
                </div>

                <div class="bonus-wrap">
                  <div class="bonus-label">Work mode <span class="bonus-optional">(optional)</span></div>
                  <div class="bonus-input-wrap">
                    <select v-model="form.work_mode" class="step-input bonus-input">
                      <option value="">Select one</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                <div class="bonus-wrap">
                  <div class="bonus-label">Annual equity / RSU value <span class="bonus-optional">(optional)</span></div>
                  <div class="bonus-input-wrap">
                    <span class="equity-prefix">$</span>
                    <input v-model.number="form.equity_value" type="number" min="0" class="step-input bonus-input" placeholder="25000" @keyup.enter="next" />
                    <span class="bonus-suffix">/yr</span>
                  </div>
                  <p v-if="equityDisplay" class="bonus-hint">Saved as {{ form.currency_code }} {{ equityDisplay }}/yr</p>
                </div>
              </div>
            </div>

            <div v-if="!isEditing" class="quick-submit">
              <div class="quick-title">You can submit with this.</div>
              <div class="quick-body">
                Job title and pay are enough for a useful entry.
                You can submit now or continue to add more context.
              </div>
              <div class="quick-actions">
                <button class="btn-primary" @click="submitSalary" :disabled="!form.salary || submitting">
                  {{ submitting ? 'SPILLING…' : 'Submit now →' }}
                </button>
                <button class="btn-secondary" type="button" @click="next" :disabled="!form.salary || submitting">
                  Keep answering →
                </button>
              </div>
              <p v-if="error" class="error-msg">{{ error }}</p>
            </div>

            <button v-else class="btn-primary step-next" @click="next" :disabled="!form.salary">Next →</button>
          </template>

          <!-- STEP 3: Company -->
          <template v-else-if="step === 3">
            <div class="step-emoji">🏢</div>
            <h2 class="step-question">Which company do you work for?</h2>
            <p class="step-hint">Optional, but useful for comparisons.</p>
            <div class="field-stack">
              <div class="field-wrap">
                <input
                  v-model="form.company"
                  type="text"
                  class="step-input"
                  maxlength="150"
                  :class="{ 'input-error': hasFieldError('company') }"
                  placeholder="Google, Microsoft, Local Hospital..."
                  autofocus
                  @input="clearFieldError('company')"
                  @keyup.enter="next"
                />
                <span v-if="hasFieldError('company')" class="field-warn" title="Needs changes">⚠</span>
              </div>
              <p v-if="hasFieldError('company')" class="field-error-msg">{{ fieldErrorMessage('company') }}</p>
            </div>
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skip">Prefer not to share</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 4: Location -->
          <template v-else-if="step === 4">
            <div class="step-emoji">📍</div>
            <h2 class="step-question">Where are you based?</h2>
            <p class="step-hint">City/state where applicable, plus country so global comparisons stay useful.</p>
            <div class="location-inputs">
              <div class="field-stack">
                <div class="field-wrap">
                  <input
                    v-model="form.city"
                    type="text"
                    class="step-input"
                    maxlength="100"
                    :class="{ 'input-error': hasFieldError('city') }"
                    placeholder="City"
                    autofocus
                    @input="clearFieldError('city')"
                    @keyup.enter="next"
                  />
                  <span v-if="hasFieldError('city')" class="field-warn" title="Needs changes">⚠</span>
                </div>
                <p v-if="hasFieldError('city')" class="field-error-msg">{{ fieldErrorMessage('city') }}</p>
              </div>
              <div class="field-stack">
                <div class="field-wrap">
                  <input
                    v-model="form.state"
                    type="text"
                    class="step-input step-input-small"
                    maxlength="50"
                    :class="{ 'input-error': hasFieldError('state') }"
                    placeholder="State"
                    @input="clearFieldError('state')"
                    @keyup.enter="next"
                  />
                  <span v-if="hasFieldError('state')" class="field-warn" title="Needs changes">⚠</span>
                </div>
                <p v-if="hasFieldError('state')" class="field-error-msg">{{ fieldErrorMessage('state') }}</p>
              </div>
              <div class="field-stack">
                <div class="field-wrap">
                  <input
                    v-model="form.country"
                    type="text"
                    class="step-input"
                    maxlength="80"
                    :class="{ 'input-error': hasFieldError('country') }"
                    placeholder="Country"
                    @input="clearFieldError('country')"
                    @keyup.enter="next"
                  />
                  <span v-if="hasFieldError('country')" class="field-warn" title="Needs changes">⚠</span>
                </div>
                <p v-if="hasFieldError('country')" class="field-error-msg">{{ fieldErrorMessage('country') }}</p>
              </div>
            </div>
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skip">Prefer not to share</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 5: Experience -->
          <template v-else-if="step === 5">
            <div class="step-emoji">⏰</div>
            <h2 class="step-question">How many years of experience do you have?</h2>
            <p class="step-hint">Use total years in this field.</p>
            <input v-model.number="form.years_experience" type="number" class="step-input" placeholder="5" min="0" max="50" autofocus @keyup.enter="next" />
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skip">Prefer not to share</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 6: Education -->
          <template v-else-if="step === 6">
            <div class="step-emoji">🎓</div>
            <h2 class="step-question">What is your education background?</h2>
            <p class="step-hint">Optional context for salary comparisons.</p>
            <div class="education-grid">
              <button
                v-for="opt in educationOptions"
                :key="opt.value"
                class="edu-option"
                :class="{ selected: form.education === opt.value, dropout: opt.isDropout, 'edu-error': hasFieldError('education') }"
                @click="selectEducation(opt); clearFieldError('education')"
              >
                <span class="edu-icon">{{ opt.icon }}</span>
                <span class="edu-label">{{ opt.label }}</span>
              </button>
            </div>
            <p v-if="hasFieldError('education')" class="field-error-msg">{{ fieldErrorMessage('education') }}</p>
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skipEducation">Prefer not to share</button>
              <button v-if="form.education" class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 7: Debt / Tuition (conditional on education type) -->
          <template v-else-if="step === 7">
            <template v-if="form.is_dropout">
              <div class="step-emoji">💸</div>
              <h2 class="step-question">How much debt did you leave with?</h2>
              <p class="step-hint">Optional. Enter your remaining education-related debt.</p>
            </template>
            <template v-else-if="isGeneralDebt">
              <div class="step-emoji">💸</div>
              <h2 class="step-question">How much debt are you in?</h2>
              <p class="step-hint">Optional. Include debt you want considered in your context.</p>
            </template>
            <template v-else>
              <div class="step-emoji">🎓💰</div>
              <h2 class="step-question">How much did all that school cost?</h2>
              <p class="step-hint">Optional. Include tuition and related costs.</p>
            </template>
            <div class="salary-input-wrap">
              <span class="salary-prefix">$</span>
              <input v-model="debtDisplay" type="text" inputmode="numeric" class="step-input salary-input" :placeholder="form.is_dropout ? '25,000' : isGeneralDebt ? '15,000' : '80,000'" autofocus @keyup.enter="next" @input="onDebtInput" />
            </div>
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skip">{{ form.is_dropout ? "Prefer not to share" : isGeneralDebt ? "No debt" : "Prefer not to share" }}</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 8: Car -->
          <template v-else-if="step === 8">
            <div class="step-emoji">🚗</div>
            <h2 class="step-question">What do you drive?</h2>
            <p class="step-hint">Optional context field.</p>
            <div class="field-stack">
              <div class="field-wrap">
                <input
                  v-model="form.car"
                  type="text"
                  class="step-input"
                  maxlength="100"
                  :class="{ 'input-error': hasFieldError('car') }"
                  placeholder="2019 Prius, Tesla Model 3, Honda Civic..."
                  autofocus
                  @input="clearFieldError('car')"
                  @keyup.enter="next"
                />
                <span v-if="hasFieldError('car')" class="field-warn" title="Needs changes">⚠</span>
              </div>
              <p v-if="hasFieldError('car')" class="field-error-msg">{{ fieldErrorMessage('car') }}</p>
            </div>
            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="skip">Public transport / none</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 9: Salary History -->
          <template v-else-if="step === 9">
            <div class="step-emoji">📈</div>
            <h2 class="step-question">Would you like to add salary history?</h2>
            <p class="step-hint">Optional, but helpful for progression context.</p>

            <div class="history-entries">
              <div v-for="(entry, i) in form.salary_history" :key="i" class="history-entry">
                <div class="history-top">
                  <input
                    v-model.number="entry.year"
                    type="number"
                    class="history-input history-year"
                    placeholder="Year"
                    min="1950"
                    :max="currentYear"
                  />

                  <div class="field-stack">
                    <div class="field-wrap">
                      <input
                        v-model="entry.job_title"
                        type="text"
                        class="history-input history-title"
                        maxlength="150"
                        :class="{ 'input-error': hasFieldError(`salary_history[${i}].job_title`) }"
                        placeholder="Title"
                        @input="clearFieldError(`salary_history[${i}].job_title`)"
                      />
                      <span v-if="hasFieldError(`salary_history[${i}].job_title`)" class="field-warn" title="Needs changes">⚠</span>
                    </div>
                    <p v-if="hasFieldError(`salary_history[${i}].job_title`)" class="field-error-msg">{{ fieldErrorMessage(`salary_history[${i}].job_title`) }}</p>
                  </div>
                </div>

                <div class="history-bottom">
                  <div class="history-salary-col">
                    <div class="history-salary-wrap">
                      <span class="history-dollar">$</span>
                    <input
                      :value="formatHistorySalary(entry.salary)"
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      autocomplete="off"
                      class="history-input history-salary"
                      :placeholder="entry.pay_type === 'hourly' ? 'Hourly' : 'Salary'"
                      @keydown="onNumericKeydown"
                      @paste="onNumericPaste($event, i)"
                      @input="onHistorySalaryInput($event, i)"
                    />
                      <span class="history-suffix">{{ entry.pay_type === 'hourly' ? '/hr' : '/yr' }}</span>
                    </div>

                    <div class="history-pay-toggle">
                      <button
                        type="button"
                        class="history-pay-btn"
                        :class="{ active: entry.pay_type === 'salary' }"
                        @click="entry.pay_type = 'salary'"
                      >
                        Salary
                      </button>
                      <button
                        type="button"
                        class="history-pay-btn"
                        :class="{ active: entry.pay_type === 'hourly' }"
                        @click="entry.pay_type = 'hourly'"
                      >
                        Hourly
                      </button>
                    </div>
                  </div>

                  <div class="field-stack">
                    <div class="field-wrap">
                      <input
                        v-model="entry.company"
                        type="text"
                        class="history-input history-company"
                        maxlength="150"
                        :class="{ 'input-error': hasFieldError(`salary_history[${i}].company`) }"
                        placeholder="Company (optional)"
                        @input="clearFieldError(`salary_history[${i}].company`)"
                      />
                      <span v-if="hasFieldError(`salary_history[${i}].company`)" class="field-warn" title="Needs changes">⚠</span>
                    </div>
                    <p v-if="hasFieldError(`salary_history[${i}].company`)" class="field-error-msg">{{ fieldErrorMessage(`salary_history[${i}].company`) }}</p>
                  </div>

                  <button class="history-remove" @click="removeHistory(i)" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <button v-if="form.salary_history.length < 10" class="history-add" @click="addHistory">
              + Add {{ form.salary_history.length === 0 ? 'a past role' : 'another' }}
            </button>

            <div class="step-actions">
              <button class="btn-secondary step-skip" @click="form.salary_history = []; skip()">Skip</button>
              <button class="btn-primary step-next" @click="next">Next →</button>
            </div>
          </template>

          <!-- STEP 10: Anonymize -->
          <template v-else-if="step === 10">
            <div class="step-emoji">🔒</div>
            <h2 class="step-question">Do you want salary anonymization?</h2>
            <p class="step-hint">We can randomly add or subtract $1–2k before storage to reduce identifiability.</p>
            <div class="anonymize-options">
              <button class="anon-option" :class="{ selected: anonChoice === 'yes' }" @click="anonChoice = 'yes'; form.is_anonymized = true">
                <span class="anon-icon">🔒</span>
                <span class="anon-title">Yes, anonymize</span>
                <span class="anon-desc">Adds a small randomized offset</span>
              </button>
              <button class="anon-option" :class="{ selected: anonChoice === 'no' }" @click="anonChoice = 'no'; form.is_anonymized = false">
                <span class="anon-icon">🎯</span>
                <span class="anon-title">No, keep exact number</span>
                <span class="anon-desc">Stores the value as entered</span>
              </button>
            </div>
            <button class="btn-primary step-next" @click="next" :disabled="!anonChoice">Next →</button>
          </template>

          <!-- STEP 11: Review + Submit -->
          <template v-else-if="step === 11">
            <div class="step-emoji">{{ isEditing ? '✅' : '💣' }}</div>
            <h2 class="step-question">{{ isEditing ? 'Review your changes' : 'Review before submitting' }}</h2>
            <p class="step-hint">Please confirm the details below.</p>

            <div v-if="hasAnyFieldErrors" class="moderation-banner">
              <div class="moderation-banner-title">⚠ Submission blocked</div>
              <div class="moderation-banner-body">
                {{ error || 'We flagged some fields as not allowed.' }}
              </div>
              <div class="moderation-banner-sub">Click a flagged field below to jump back and edit.</div>

              <div class="moderation-list">
                <button
                  v-for="v in lastViolations"
                  :key="v.field"
                  class="moderation-pill"
                  type="button"
                  @click="goToField(v.field)"
                >
                  <span class="pill-label">{{ labelForField(v.field) }}</span>
                  <span class="pill-reason">{{ v.explanation || v.categories?.join(', ') || 'Not allowed.' }}</span>
                </button>
              </div>
            </div>

            <div class="review-card">
              <div class="review-item" :class="{ 'review-error': hasFieldError('job_title') }" @click="hasFieldError('job_title') && goToField('job_title')">
                <span class="review-label">Job <span v-if="hasFieldError('job_title')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ form.job_title }}</span>
                  <button v-if="hasFieldError('job_title')" class="review-edit" type="button" @click.stop="goToField('job_title')">Edit</button>
                </span>
              </div>

              <div class="review-item" :class="{ 'review-error': hasFieldError('pay_type') }" @click="hasFieldError('pay_type') && goToField('pay_type')">
                <span class="review-label">Pay <span v-if="hasFieldError('pay_type')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ reviewPayText }}</span>
                  <button v-if="hasFieldError('pay_type')" class="review-edit" type="button" @click.stop="goToField('pay_type')">Edit</button>
                </span>
              </div>

              <div v-if="form.company" class="review-item" :class="{ 'review-error': hasFieldError('company') }" @click="hasFieldError('company') && goToField('company')">
                <span class="review-label">Company <span v-if="hasFieldError('company')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ form.company }}</span>
                  <button v-if="hasFieldError('company')" class="review-edit" type="button" @click.stop="goToField('company')">Edit</button>
                </span>
              </div>

              <div v-if="form.city || form.state || form.country || form.currency_code" class="review-item" :class="{ 'review-error': hasFieldError('city') || hasFieldError('state') || hasFieldError('country') || hasFieldError('currency_code') }" @click="(hasFieldError('city') || hasFieldError('state') || hasFieldError('country') || hasFieldError('currency_code')) && goToField(hasFieldError('city') ? 'city' : (hasFieldError('state') ? 'state' : (hasFieldError('country') ? 'country' : 'currency_code')))">
                <span class="review-label">Location <span v-if="hasFieldError('city') || hasFieldError('state') || hasFieldError('country') || hasFieldError('currency_code')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ [form.city, form.state, form.country].filter(Boolean).join(', ') }} · {{ form.currency_code }}</span>
                  <button v-if="hasFieldError('city') || hasFieldError('state') || hasFieldError('country') || hasFieldError('currency_code')" class="review-edit" type="button" @click.stop="goToField(hasFieldError('city') ? 'city' : (hasFieldError('state') ? 'state' : (hasFieldError('country') ? 'country' : 'currency_code')))">Edit</button>
                </span>
              </div>

              <div v-if="form.years_experience" class="review-item">
                <span class="review-label">Experience</span>
                <span class="review-right"><span class="review-value">{{ form.years_experience }} years</span></span>
              </div>

              <div v-if="form.level || form.work_mode || form.equity_value !== null" class="review-item">
                <span class="review-label">Role details</span>
                <span class="review-right">
                  <span class="review-value">
                    {{ [form.level || null, form.work_mode ? (form.work_mode.charAt(0).toUpperCase() + form.work_mode.slice(1)) : null, form.equity_value !== null ? (`${form.currency_code} ${formatNum(form.equity_value)} equity`) : null].filter(Boolean).join(' · ') }}
                  </span>
                </span>
              </div>

              <div v-if="form.education" class="review-item" :class="{ 'review-error': hasFieldError('education') }" @click="hasFieldError('education') && goToField('education')">
                <span class="review-label">Education <span v-if="hasFieldError('education')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ form.education }}</span>
                  <button v-if="hasFieldError('education')" class="review-edit" type="button" @click.stop="goToField('education')">Edit</button>
                </span>
              </div>

              <div v-if="form.education_debt !== null" class="review-item">
                <span class="review-label">{{ form.is_dropout ? 'Debt' : isGeneralDebt ? 'Debt' : 'School Cost' }}</span>
                <span class="review-right"><span class="review-value">${{ formatNum(form.education_debt) }}</span></span>
              </div>

              <div v-if="form.car" class="review-item" :class="{ 'review-error': hasFieldError('car') }" @click="hasFieldError('car') && goToField('car')">
                <span class="review-label">Car <span v-if="hasFieldError('car')" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ form.car }}</span>
                  <button v-if="hasFieldError('car')" class="review-edit" type="button" @click.stop="goToField('car')">Edit</button>
                </span>
              </div>

              <div v-if="form.salary_history.length" class="review-item" :class="{ 'review-error': hasHistoryErrors }" @click="hasHistoryErrors && goToField(firstHistoryErrorField)">
                <span class="review-label">History <span v-if="hasHistoryErrors" class="review-warn">⚠</span></span>
                <span class="review-right">
                  <span class="review-value">{{ form.salary_history.length }} past {{ form.salary_history.length === 1 ? 'role' : 'roles' }}</span>
                  <button v-if="hasHistoryErrors" class="review-edit" type="button" @click.stop="goToField(firstHistoryErrorField)">Edit</button>
                </span>
              </div>
            </div>

            <button class="btn-primary submit-btn" @click="submitSalary" :disabled="submitting">{{ submitting ? (isEditing ? 'UPDATING...' : 'SPILLING THE TEA...') : (isEditing ? 'UPDATE MY SALARY ✅' : 'SPILL THE TEA ☕') }}</button>
            <p v-if="error && !hasAnyFieldErrors" class="error-msg">{{ error }}</p>
          </template>

        </div>
      </Transition>
      <button v-if="step > 1 && step <= totalSteps" class="back-btn" @click="goBack">← Back</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  editData?: any
  editToken?: string
}>()

const isEditing = computed(() => !!props.editToken)

const step = ref(1)
const totalSteps = 11
const currentYear = new Date().getFullYear()
const submitting = ref(false)
const error = ref('')
const salaryDisplay = ref('')
const hourlyDisplay = ref('')
const bonusDisplay = ref('')
const debtDisplay = ref('')
const showCompDetails = ref(false)
const anonChoice = ref<'yes' | 'no' | null>(null)
const jobTitleSuggestions = ref<string[]>([])
const showJobTitleSuggestions = ref(false)
let jobTitleSuggestionTimer: ReturnType<typeof setTimeout> | null = null

// Field-level moderation errors returned by the server.
const fieldErrors = reactive<Record<string, string>>({})
const lastViolations = ref<Violation[]>([])

function clearAllFieldErrors() {
  for (const k of Object.keys(fieldErrors)) delete fieldErrors[k]
  lastViolations.value = []
}

function clearFieldError(field: string) {
  if (field in fieldErrors) delete fieldErrors[field]
}

function hasFieldError(field: string) {
  return field in fieldErrors
}

function fieldErrorMessage(field: string): string {
  return fieldErrors[field] || ''
}

type Violation = {
  field: string
  categories?: string[]
  explanation?: string
}

function extractViolations(err: any): Violation[] {
  const v = err?.data?.data?.violations || err?.data?.violations || err?.data?.data?.data?.violations
  if (Array.isArray(v)) return v
  return []
}

function stepForField(field: string): number | null {
  if (field === 'job_title') return 1
  if (field === 'pay_type') return 2
  if (field === 'company') return 3
  if (field === 'city' || field === 'state') return 4
  if (field === 'currency_code') return 2
  if (field === 'country') return 4
  if (field === 'level' || field === 'work_mode' || field === 'equity_value') return 2
  if (field === 'education') return 6
  if (field === 'car') return 8
  if (/^salary_history\[\d+\]\./.test(field)) return 9
  return null
}

function applyViolations(violations: Violation[]) {
  clearAllFieldErrors()
  lastViolations.value = violations.filter(v => !!v?.field).map(v => ({
    field: String(v.field),
    categories: v.categories,
    explanation: v.explanation,
  }))

  for (const v of lastViolations.value) {
    const msg = String(v.explanation || '')
      || (Array.isArray(v.categories) && v.categories.length > 0 ? v.categories.join(', ') : '')
      || 'Not allowed.'

    fieldErrors[String(v.field)] = msg
  }
}

const hasAnyFieldErrors = computed(() => Object.keys(fieldErrors).length > 0)
const hasHistoryErrors = computed(() => Object.keys(fieldErrors).some(k => k.startsWith('salary_history[')))
const firstHistoryErrorField = computed(() => Object.keys(fieldErrors).find(k => k.startsWith('salary_history[')) || 'salary_history[0].job_title')

function labelForField(field: string): string {
  if (field === '*') return 'Some fields'
  if (field === 'job_title') return 'Job title'
  if (field === 'pay_type') return 'Pay type'
  if (field === 'company') return 'Company'
  if (field === 'city') return 'City'
  if (field === 'state') return 'State'
  if (field === 'country') return 'Country'
  if (field === 'currency_code') return 'Currency'
  if (field === 'level') return 'Level'
  if (field === 'work_mode') return 'Work mode'
  if (field === 'equity_value') return 'Equity value'
  if (field === 'education') return 'Education'
  if (field === 'car') return 'Car'

  const m = /^salary_history\[(\d+)\]\.(job_title|company)$/.exec(field)
  if (m) {
    const idx = Number(m[1]) + 1
    const part = m[2] === 'job_title' ? 'title' : 'company'
    return `Career history #${idx} ${part}`
  }

  return field
}

function goToField(field: string) {
  if (field === '*') {
    // If we couldn't determine the exact field, take them back to the start.
    step.value = 1
    nextTick(() => {})
    return
  }
  showJobTitleSuggestions.value = true

  // Map to step and jump.
  const s = stepForField(field)

  if (s) {
    step.value = s
    if (field === 'level' || field === 'work_mode' || field === 'equity_value') {
      showCompDetails.value = true
    }
    // Many steps already use autofocus, so this is usually enough.
    nextTick(() => {})
    return
  }
}

const emit = defineEmits<{ submitted: [result: any] }>()

interface HistoryItem {
  year: number | null
  job_title: string
  // Amount: yearly salary if pay_type=salary, hourly rate if pay_type=hourly
  salary: number
  pay_type: 'salary' | 'hourly'
  company: string
}

const form = reactive({
  job_title: '',
  salary: 0,
  pay_type: 'salary' as 'salary' | 'hourly',
  bonus_percent: null as number | null,
  company: '',
  city: '',
  state: '',
  country: '',
  currency_code: 'USD',
  years_experience: null as number | null,
  level: '',
  work_mode: '' as '' | 'remote' | 'hybrid' | 'onsite',
  equity_value: null as number | null,
  education: '',
  is_dropout: false,
  education_debt: null as number | null,
  car: '',
  is_anonymized: false,
  salary_history: [] as HistoryItem[],
})

const educationOptions = [
  { value: 'High School', label: 'High School', icon: '🏫', isDropout: false },
  { value: 'Some College', label: 'Some College', icon: '📚', isDropout: false },
  { value: 'College Dropout', label: 'College Dropout', icon: '🎓🔥', isDropout: true },
  { value: "Bachelor's", label: "Bachelor's", icon: '🎓', isDropout: false },
  { value: "Master's", label: "Master's", icon: '📜', isDropout: false },
  { value: 'PhD', label: 'PhD', icon: '🧪', isDropout: false },
  { value: 'Self-taught', label: 'Self-taught', icon: '💻', isDropout: false },
  { value: 'Bootcamp', label: 'Bootcamp', icon: '🏋️', isDropout: false },
  { value: 'Trade School', label: 'Trade School', icon: '🔧', isDropout: false },
]

// Education options where we ask about general debt instead of tuition
const generalDebtOptions = new Set(['High School', 'Self-taught'])

function selectEducation(opt: typeof educationOptions[0]) { form.education = opt.value; form.is_dropout = opt.isDropout }

function switchPayType(type: 'salary' | 'hourly') {
  form.pay_type = type; form.salary = 0; salaryDisplay.value = ''; hourlyDisplay.value = ''
}

function onSalaryInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  const num = parseInt(raw) || 0
  form.salary = num
  salaryDisplay.value = num ? num.toLocaleString() : ''
}

function onHourlyInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  const num = parseInt(raw) || 0
  form.salary = num * 2080
  hourlyDisplay.value = raw
}

function onBonusInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  if (!raw) {
    form.bonus_percent = null
    bonusDisplay.value = ''
    return
  }

  const num = Math.max(0, Math.min(200, parseInt(raw) || 0))
  form.bonus_percent = num
  bonusDisplay.value = String(num)
}

function onJobTitleInput() {
  clearFieldError('job_title')
  if (jobTitleSuggestionTimer) clearTimeout(jobTitleSuggestionTimer)

  const q = String(form.job_title || '').trim()
  if (!q || q.length < 2) {
    jobTitleSuggestions.value = []
    showJobTitleSuggestions.value = false
    return
  }

  jobTitleSuggestionTimer = setTimeout(async () => {
    try {
      const res = await $fetch('/api/job-titles', {
        params: { q, limit: '8' }
      }) as { suggestions?: string[] }
      const suggestions = Array.isArray(res?.suggestions) ? res.suggestions : []
      const qLower = q.toLowerCase()
      jobTitleSuggestions.value = suggestions.filter(s => String(s).toLowerCase() !== qLower)
      showJobTitleSuggestions.value = jobTitleSuggestions.value.length > 0
    } catch {
      jobTitleSuggestions.value = []
      showJobTitleSuggestions.value = false
    }
  }, 180)
}

function onJobTitleFocus() {
  showJobTitleSuggestions.value = jobTitleSuggestions.value.length > 0
}

function onJobTitleBlur() {
  setTimeout(() => {
    showJobTitleSuggestions.value = false
  }, 120)
}

function selectJobTitleSuggestion(title: string) {
  form.job_title = title
  clearFieldError('job_title')
  showJobTitleSuggestions.value = false
}

function onDebtInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  if (raw === '') {
    form.education_debt = null
    debtDisplay.value = ''
    return
  }
  const num = parseInt(raw) || 0
  form.education_debt = num
  debtDisplay.value = num.toLocaleString()
}

const isGeneralDebt = computed(() => generalDebtOptions.has(form.education))
const equityDisplay = computed(() => form.equity_value !== null && form.equity_value > 0 ? formatNum(form.equity_value) : '')

// Pre-fill form when editing
onMounted(() => {
  if (props.editData && props.editToken) {
    const d = props.editData
    form.job_title = d.job_title || ''
    form.salary = d.salary || 0
    form.pay_type = d.pay_type || 'salary'
    form.bonus_percent = typeof d.bonus_percent === 'number' ? d.bonus_percent : null
    form.company = d.company || ''
    form.city = d.city || ''
    form.state = d.state || ''
    form.country = d.country || ''
    form.currency_code = d.currency_code || 'USD'
    form.years_experience = d.years_experience ?? null
    form.level = d.level || ''
    form.work_mode = d.work_mode || ''
    form.equity_value = typeof d.equity_value === 'number' ? d.equity_value : null
    form.education = d.education || ''
    form.is_dropout = !!d.is_dropout
    form.education_debt = d.education_debt ?? null
    form.car = d.car || ''
    form.is_anonymized = !!d.is_anonymized
    form.salary_history = (d.salary_history || []).map((h: any) => ({
      year: h.year,
      job_title: h.job_title,
      salary: h.salary,
      pay_type: 'salary',
      company: h.company || ''
    }))

    // Set display values
    if (form.pay_type === 'hourly') {
      hourlyDisplay.value = String(Math.round(form.salary / 2080))
    } else {
      salaryDisplay.value = form.salary ? form.salary.toLocaleString() : ''
    }

    if (form.bonus_percent !== null && Number.isFinite(form.bonus_percent)) {
      bonusDisplay.value = String(form.bonus_percent)
    }
    if (form.education_debt !== null) {
      debtDisplay.value = form.education_debt.toLocaleString()
    }
    if (form.is_anonymized) {
      anonChoice.value = 'yes'
    } else {
      anonChoice.value = 'no'
    }
    if (form.level || form.work_mode || form.equity_value !== null) {
      showCompDetails.value = true
    }
  }
})

onBeforeUnmount(() => {
  if (jobTitleSuggestionTimer) clearTimeout(jobTitleSuggestionTimer)
})

function addHistory() {
  form.salary_history.push({ year: null, job_title: '', salary: 0, pay_type: 'salary', company: '' })
}

function removeHistory(i: number) {
  form.salary_history.splice(i, 1)
}

function formatHistorySalary(val: number) {
  return val ? val.toLocaleString() : ''
}

function onNumericKeydown(e: KeyboardEvent) {
  // Allow navigation / editing keys
  if (
    e.key === 'Backspace'
    || e.key === 'Delete'
    || e.key === 'Tab'
    || e.key === 'Enter'
    || e.key === 'ArrowLeft'
    || e.key === 'ArrowRight'
    || e.key === 'Home'
    || e.key === 'End'
  ) {
    return
  }

  // Allow copy/paste shortcuts
  if (e.metaKey || e.ctrlKey) return

  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault()
  }
}

function onNumericPaste(e: ClipboardEvent, i: number) {
  const text = e.clipboardData?.getData('text') || ''
  const digits = text.replace(/[^0-9]/g, '')
  if (digits !== text) {
    e.preventDefault()
    form.salary_history[i].salary = parseInt(digits) || 0
  }
}

function onHistorySalaryInput(e: Event, i: number) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  form.salary_history[i].salary = parseInt(raw) || 0
}

function next() {
  let n = step.value + 1
  if (n === 7 && !form.education) n = 8
  if (n <= totalSteps) step.value = n
}

function skip() {
  let n = step.value + 1
  if (n === 7 && !form.education) n = 8
  if (n <= totalSteps) step.value = n
}

function skipEducation() { form.education = ''; form.is_dropout = false; step.value = 8 }

function goBack() {
  let p = step.value - 1
  if (p === 7 && !form.education) p = 6
  step.value = p
}

function formatNum(n: number) { return n.toLocaleString() }

const reviewPayText = computed(() => {
  const base = form.pay_type === 'hourly'
    ? `$${hourlyDisplay.value}/hr ($${formatNum(form.salary)}/yr)`
    : `$${formatNum(form.salary)}/yr`

  const bonus = (form.bonus_percent !== null && form.bonus_percent > 0)
    ? ` + ${form.bonus_percent}% bonus`
    : ''

  const anon = form.is_anonymized ? ' · fuzzed ±$1-2k' : ''

  return `${base}${bonus}${anon}`
})

async function submitSalary() {
  submitting.value = true; error.value = ''
  clearAllFieldErrors()
  try {
    const payload = {
      job_title: form.job_title, salary: form.salary, pay_type: form.pay_type,
      bonus_percent: form.bonus_percent ?? undefined,
      company: form.company || undefined, city: form.city || undefined, state: form.state || undefined,
      country: form.country || undefined, currency_code: form.currency_code || undefined,
      years_experience: form.years_experience || undefined, education: form.education || undefined,
      level: form.level || undefined, work_mode: form.work_mode || undefined, equity_value: form.equity_value ?? undefined,
      is_dropout: form.is_dropout, education_debt: form.education_debt ?? undefined,
      car: form.car || undefined, is_anonymized: form.is_anonymized,
      salary_history: form.salary_history
        .filter(h => {
          const hasYear = !!h.year
          const hasTitle = !!h.job_title?.trim()
          const hasSalary = Number(h.salary || 0) > 0
          const hasCompany = !!h.company?.trim()
          return hasYear || hasTitle || hasSalary || hasCompany
        })
        .slice(0, 10)
        .map(h => ({
          year: h.year || undefined,
          job_title: h.job_title,
          salary: h.pay_type === 'hourly' ? Number(h.salary || 0) * 2080 : Number(h.salary || 0),
          company: h.company || undefined
        })),
    }

    if (isEditing.value && props.editToken) {
      const res = await $fetch('/api/edit', {
        method: 'POST',
        body: { token: props.editToken, ...payload }
      })
      clearAllFieldErrors()
      emit('submitted', { ...res, isEdit: true })
    } else {
      const res = await $fetch('/api/submit', {
        method: 'POST',
        body: payload
      })
      clearAllFieldErrors()
      emit('submitted', res)
    }
  } catch (err: any) {
    const violations = extractViolations(err)
    if (violations.length > 0) {
      // Keep them on the review page, but flag the fields and allow click-through.
      step.value = 11
      applyViolations(violations)
      error.value = err.data?.statusMessage || err.data?.message || 'Keep it clean. Offensive language is not allowed.'
    } else {
      error.value = err.data?.message || err.data?.statusMessage || err.message || 'Something broke. Try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.field-stack { width: 100%; }

.field-wrap { position: relative; width: 100%; }
.field-warn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #ef4444; font-weight: 800; pointer-events: none; }

.field-wrap .step-input,
.field-wrap .history-input {
  padding-right: 2.5rem;
}

.suggestions-menu {
  margin-top: 0.5rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  background: var(--white);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  text-align: left;
}

.suggestion-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.65rem 0.9rem;
  color: var(--gray-700);
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
}

.suggestion-item + .suggestion-item {
  border-top: 1px solid var(--gray-100);
}

.suggestion-item:hover {
  background: var(--green-50);
  color: var(--green-700);
}

.field-error-msg {
  margin-top: 0.4rem;
  color: #ef4444;
  font-size: 0.9rem;
  line-height: 1.35;
}

.input-error { border-color: #ef4444 !important; }
.edu-error { outline: 2px solid rgba(239, 68, 68, 0.6); border-color: #ef4444; }

.location-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step-input-small {
  width: 100%;
}


.submit-flow { min-height: calc(100vh - 64px); display: flex; flex-direction: column; }
.progress { position: fixed; top: 64px; left: 0; right: 0; height: 4px; background: var(--green-100); z-index: 50; }
.progress-bar { height: 100%; background: var(--green-600); transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 0 2px 2px 0; }
.flow-inner { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; max-width: 600px; margin: 0 auto; padding: 3rem 1.5rem 5rem; width: 100%; position: relative; }
.step { width: 100%; text-align: center; }
.step-emoji { font-size: 3.5rem; margin-bottom: 1.5rem; }
.step-question { font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 700; color: var(--gray-900); margin-bottom: 0.75rem; line-height: 1.2; }
.step-hint { font-size: 1rem; color: var(--gray-500); margin-bottom: 2rem; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto; }
.step-input { width: 100%; padding: 1rem 1.25rem; border: 2px solid var(--gray-200); border-radius: var(--radius-lg); font-family: var(--font-body); font-size: 1.15rem; color: var(--gray-900); background: var(--white); outline: none; transition: border-color 0.2s; text-align: center; }
.step-input:focus { border-color: var(--green-400); box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1); }
.step-input::placeholder { color: var(--gray-400); }

.pay-toggle { display: flex; margin-bottom: 1.5rem; background: var(--gray-100); border-radius: var(--radius-lg); padding: 4px; max-width: 280px; margin-left: auto; margin-right: auto; }
.pay-toggle-btn { flex: 1; padding: 0.6rem 1.25rem; border: none; border-radius: var(--radius-md); font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.2s; background: transparent; color: var(--gray-500); }
.pay-toggle-btn.active { background: var(--white); color: var(--green-600); box-shadow: var(--shadow-sm); }

.salary-input-wrap { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.salary-prefix { font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--green-600); }
.salary-input { flex: 1; font-size: 2rem; font-family: var(--font-display); font-weight: 700; color: var(--green-600); }
.salary-suffix { font-size: 1rem; color: var(--gray-400); font-weight: 500; }
.hourly-calc { font-size: 0.95rem; color: var(--green-600); font-weight: 500; margin-bottom: 1.5rem; }
.hourly-note { color: var(--gray-400); font-weight: 400; font-size: 0.85rem; }

.bonus-wrap {
  margin-top: 1.25rem;
  text-align: left;
}

.comp-details {
  margin-top: 1.25rem;
  text-align: left;
}

.comp-details-toggle {
  width: 100%;
  border: 2px dashed var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  padding: 0.7rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.comp-details-toggle:hover {
  border-color: var(--green-300);
  color: var(--green-700);
  background: var(--green-50);
}

.comp-details-panel {
  margin-top: 0.75rem;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 0.25rem 0.9rem 0.9rem;
  background: var(--white);
}

.bonus-label {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--gray-700);
  margin-bottom: 0.4rem;
}

.bonus-optional {
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--gray-400);
  font-size: 0.9rem;
}

.bonus-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bonus-input {
  text-align: center;
  max-width: 160px;
}

.bonus-suffix {
  color: var(--gray-400);
  font-weight: 700;
}

.equity-prefix {
  color: var(--gray-500);
  font-weight: 700;
  font-size: 1.05rem;
}

.bonus-hint {
  margin-top: 0.4rem;
  color: var(--gray-400);
  font-size: 0.9rem;
}

.quick-submit {
  margin-top: 1.25rem;
  background: var(--green-50);
  border: 2px solid var(--green-100);
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-align: left;
}

.quick-title {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--green-700);
  margin-bottom: 0.35rem;
}

.quick-body {
  color: var(--gray-600);
  line-height: 1.55;
  margin-bottom: 0.9rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

.step-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
.step-next { margin-top: 2rem; }
.step-actions .step-next, .step-actions .step-skip { margin-top: 0; }

.education-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
.edu-option { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 1rem 0.75rem; background: var(--white); border: 2px solid var(--gray-200); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
.edu-option:hover { border-color: var(--green-300); background: var(--green-50); }
.edu-option.selected { border-color: var(--green-500); background: var(--green-50); box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15); }
.edu-option.dropout.selected { border-color: var(--green-600); background: var(--green-100); }
.edu-icon { font-size: 1.5rem; }
.edu-label { font-size: 0.8rem; font-weight: 600; color: var(--gray-700); }

.anonymize-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
.anon-option { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem 1rem; background: var(--white); border: 2px solid var(--gray-200); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; }
.anon-option:hover { border-color: var(--green-300); }
.anon-option.selected { border-color: var(--green-500); background: var(--green-50); box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15); }
.anon-icon { font-size: 2rem; }
.anon-title { font-family: var(--font-display); font-weight: 600; font-size: 1rem; color: var(--gray-900); }
.anon-desc { font-size: 0.8rem; color: var(--gray-500); }

.moderation-banner {
  background: var(--danger-bg);
  border: 2px solid var(--danger-border);
  border-radius: var(--radius-lg);
  padding: 1rem 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.moderation-banner-title {
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--danger-title);
  margin-bottom: 0.25rem;
}

.moderation-banner-body {
  color: var(--danger-text);
  line-height: 1.5;
}

.moderation-banner-sub {
  margin-top: 0.5rem;
  color: var(--danger-title);
  font-size: 0.9rem;
}

.moderation-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.moderation-pill {
  width: 100%;
  text-align: left;
  background: var(--danger-pill-bg);
  border: 1px solid var(--danger-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 0.75rem;
  cursor: pointer;
}

.moderation-pill:hover {
  border-color: var(--danger-border-hover);
}

.pill-label {
  display: block;
  font-weight: 800;
  color: var(--danger-title);
  font-family: var(--font-display);
}

.pill-reason {
  display: block;
  margin-top: 0.2rem;
  color: var(--danger-text);
  font-size: 0.92rem;
}

.review-card { background: var(--white); border: 2px solid var(--green-200); border-radius: var(--radius-lg); padding: 1.5rem; text-align: left; margin-bottom: 2rem; }
.review-item { display: flex; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--gray-100); font-size: 1rem; color: var(--gray-800); }
.review-item:last-child { border-bottom: none; }
.review-label { font-weight: 600; color: var(--gray-500); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
.review-right { display: inline-flex; gap: 0.75rem; align-items: center; justify-content: flex-end; }
.review-value { text-align: right; }
.review-warn { color: #ef4444; margin-left: 0.25rem; }
.review-error { cursor: pointer; }
.review-error:hover { background: rgba(254, 202, 202, 0.15); }
.review-error .review-label { color: #b91c1c; }
.review-edit {
  border: 1px solid var(--danger-border);
  background: var(--white);
  color: var(--danger-title);
  border-radius: 999px;
  padding: 0.3rem 0.6rem;
  font-weight: 700;
  cursor: pointer;
}
.review-edit:hover { border-color: #fca5a5; }

.submit-btn { font-size: 1.3rem; padding: 1.25rem 3rem; letter-spacing: 0.02em; }
.error-msg { color: #ef4444; margin-top: 1rem; font-size: 0.9rem; }

.history-entries {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.history-entry {
  background: var(--white);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.history-top {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.history-bottom {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: 0.75rem;
}

.history-salary-col {
  width: 230px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.history-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--gray-900);
  background: var(--white);
  outline: none;
  transition: border-color 0.2s;
  text-align: left;
}

.history-input:focus {
  border-color: var(--green-400);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08);
}

.history-input::placeholder { color: var(--gray-400); }

.history-year {
  width: 110px;
  flex-shrink: 0;
  text-align: center;
}

.history-title { flex: 1; }

.history-salary-wrap {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  width: 100%;
}

.history-dollar {
  position: absolute;
  left: 0.9rem;
  font-weight: 800;
  color: var(--green-700);
  font-size: 0.95rem;
  z-index: 1;
}

.history-salary {
  width: 100%;
  padding-left: 1.8rem;
  text-align: center;
}

.history-suffix {
  margin-left: 0.5rem;
  color: var(--gray-400);
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
}

.history-company { flex: 1; }

.history-pay-toggle {
  display: inline-flex;
  background: var(--gray-100);
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 3px;
  margin-top: 0.5rem;
}

.history-pay-btn {
  border: none;
  background: transparent;
  color: var(--gray-500);
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.35rem 0.55rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.history-pay-btn.active {
  background: var(--white);
  color: var(--green-700);
  box-shadow: var(--shadow-sm);
}
.history-remove { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; background: none; color: var(--gray-400); cursor: pointer; border-radius: var(--radius-sm); transition: all 0.2s; }
.history-remove:hover { background: #fef2f2; color: #ef4444; }
.history-add { display: block; width: 100%; padding: 0.75rem; border: 2px dashed var(--gray-200); border-radius: var(--radius-md); background: transparent; font-family: var(--font-body); font-size: 0.95rem; font-weight: 500; color: var(--green-600); cursor: pointer; transition: all 0.2s; margin-bottom: 1rem; }
.history-add:hover { border-color: var(--green-400); background: var(--green-50); }

.back-btn { position: fixed; bottom: 2rem; left: 2rem; background: var(--white); border: 2px solid var(--gray-200); border-radius: var(--radius-full); padding: 0.6rem 1.25rem; font-family: var(--font-body); font-weight: 500; color: var(--gray-500); cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
.back-btn:hover { border-color: var(--green-300); color: var(--green-600); }

@media (max-width: 640px) {
  .education-grid { grid-template-columns: repeat(2, 1fr); }
  .anonymize-options { grid-template-columns: 1fr; }
  .location-inputs { grid-template-columns: 1fr; }
  .step-input-small { width: 100%; }
  .salary-input { font-size: 1.5rem; }
  .salary-prefix { font-size: 1.5rem; }
  .back-btn { bottom: 1rem; left: 1rem; }
  .history-top,
  .history-bottom {
    flex-direction: column;
  }

  .history-salary-col {
    width: 100%;
  }

  .history-year {
    width: 100%;
    text-align: left;
  }
}
</style>
