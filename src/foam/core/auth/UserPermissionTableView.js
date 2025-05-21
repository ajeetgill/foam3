/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.auth',
  name: 'UserPermissionTableView',
  extends: 'foam.core.auth.PermissionTableView',

  imports: [
    'capabilityDAO',
    'crunchService',
    'userCapabilityJunctionDAO',
    'userDAO'
  ],

  requires: [
    'foam.core.auth.LifecycleState',
    'foam.core.auth.ServiceProvider',
    'foam.core.auth.User',
    'foam.core.crunch.Capability',
    'foam.core.crunch.CapabilityJunctionStatus',
    'foam.core.crunch.UserCapabilityJunction'
  ],

  messages: [
    { name: 'SELECT_USER', message: 'Please select a user: ' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showSearch',
      value: false
    },
    {
      name: 'rolesOnly',
      value: true
    },
    {
      name: 'selectedUser',
      postSet: function(_, n) {
        n.displayName_ = n.legalName;
        if ( n?.id )
          this.gs = [n];
        else
          this.gs = [];
      }
    },
    [ 'gs', []]
  ],

  css: `
    ^groupLabel {
      background-color: $grey100;
      border: 1px solid $grey400;
      font-weight: normal;
      padding-top: 4px;
      padding-inline: 8px;
      white-space: nowrap;
      writing-mode: unset;
      color: $black;
      // position: absolute;

      font-weight: 500;
    }
  `,

  methods: [
    async function render() {
      var SUPER = this.SUPER.bind(this);

      // add user dropdown;
      this.userDAO = this.userDAO.where(this.NOT(this.IN(this.User.GROUP, ['system', 'admin', 'anonymous', 'paytic-anonymous'])));
      this
        .start().addClass('p-label-lg')
          .style({ 'padding': '8px 0'})
          .add(this.SELECT_USER)
        .end()
        .start({
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Users',
              dao: this.userDAO
            }
          ],
          fullObject_$: this.selectedUser$
        }).style({
          'width': '100%'
        }).end()

      SUPER();
    },
    async function initMap() {
      var self = this;
      var ucjs = await this.userCapabilityJunctionDAO.select();
      ucjs.array.forEach(ucj => {
        var user = ucj.sourceId, cap = ucj.targetId;
        var key = cap + ':' + user;

        var data = this.GroupPermission.create({
          checked: ucj.status === this.CapabilityJunctionStatus.GRANTED
        });

        data.checked$.sub(function() {
          self.updateGroup(cap, user, data.checked$, self);
        });
        this.gpMap[key] = data;
      });

    },

    async function getColumns() {
      if ( ! this.selectedUser ) return []
      var gs = (await this.userDAO.where(this.EQ(this.User.ID, this.selectedUser.id)).select()).array;
      if ( ! gs?.length ) gs = [ this.selectedUser ];

      for ( var i = 0 ; i < gs.length ; i ++ ) {
        gs[i].displayName_ = gs[i].legalName;
      }
      return gs;
    },

    async function getRows() {
      var permissions = (await this.permissionDAO.orderBy(this.Permission.ID).select()).array;
      var capabilities = [];
      for ( var i = 0; i < permissions.length; i++ ) {
        var cap = this.Capability.create({
          id: permissions[i].id,
          permissionsGranted: [ permissions[i].id ],
          lifecycleState: this.LifecycleState.ACTIVE
        });
        vap = await this.capabilityDAO.put(cap);
        capabilities.push(cap);
      }
      return capabilities;
    },

    async function updateGroup(c_, u_, data) {
      var user = this.User.isInstance(u_) ? u_ :
                  u_.id == this.selectedUser.id ? this.selectedUser :
                    await this.userDAO.find(u_);
      var ucj = await this.crunchService.getJunctionFor(
        null, c_?.id || c_, user, user
      );
      if ( data.get() ) {
        ucj.status = this.CapabilityJunctionStatus.GRANTED;
        this.userCapabilityJunctionDAO.put(ucj);
      } else {
        ucj.status = this.CapabilityJunctionStatus.REJECTED;
        this.userCapabilityJunctionDAO.put(ucj);
      }
    }
  ]
});
